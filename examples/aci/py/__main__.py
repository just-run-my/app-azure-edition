"""An Azure RM Python Pulumi program"""

import pulumi
from pulumi_azure_native import containerinstance
from pulumi_azure_native import containerregistry
from pulumi_azure_native import resources
import pulumi_docker as docker

resource_group = resources.ResourceGroup("resourceGroup")

image_name = "mcr.microsoft.com/azuredocs/aci-helloworld"
container_group = containerinstance.ContainerGroup("containerGroup",
                                                   resource_group_name=resource_group.name,
                                                   os_type="Linux",
                                                   containers=[containerinstance.ContainerArgs(
                                                       name="acilinuxpublicipcontainergroup",
                                                       image=image_name,
                                                       ports=[containerinstance.ContainerPortArgs(port=80)],
                                                       resources=containerinstance.ResourceRequirementsArgs(
                                                           requests=containerinstance.ResourceRequestsArgs(
                                                               cpu=1.0,
                                                               memory_in_gb=1.5,
                                                           )
                                                       ),
                                                   )],
                                                   ip_address=containerinstance.IpAddressArgs(
                                                       ports=[containerinstance.PortArgs(
                                                           port=80,
                                                           protocol="Tcp",
                                                       )],
                                                       type="Public",
                                                   ),
                                                   restart_policy="always",
                                                   )

custom_image = "node-app"
registry = containerregistry.Registry(
    "registry",
    resource_group_name=resource_group.name,
    sku=containerregistry.SkuArgs(
        name="Basic",
    ),
    admin_user_enabled=True)

credentials = containerregistry.list_registry_credentials_output(resource_group_name=resource_group.name,
                                                                 registry_name=registry.name)
admin_username = credentials.username
admin_password = credentials.passwords[0]["value"]

my_image = docker.Image(
    custom_image,
    image_name=registry.login_server.apply(
        lambda login_server: f"{login_server}/{custom_image}:v1.0.0"),
    build=docker.DockerBuild(context=f"../{custom_image}"),
    registry=docker.ImageRegistry(
        server=registry.login_server,
        username=admin_username,
        password=admin_password
    )
)


my_container_group = containerinstance.ContainerGroup("myDockerContainerGroup",
                                                   resource_group_name=resource_group.name,
                                                   os_type="Linux",
                                                   image_registry_credentials=[containerinstance.ImageRegistryCredentialArgs(
                                                       server=registry.login_server,
                                                       username=admin_username,
                                                       password=admin_password,
                                                     )
                                                   ],
                                                   containers=[containerinstance.ContainerArgs(
                                                       name="acilinuxpublicipcontainergroup",
                                                       image=my_image.image_name,
                                                       ports=[containerinstance.ContainerPortArgs(port=80)],
                                                       resources=containerinstance.ResourceRequirementsArgs(
                                                           requests=containerinstance.ResourceRequestsArgs(
                                                               cpu=1.0,
                                                               memory_in_gb=1.5,
                                                           )
                                                       ),
                                                   )],
                                                   ip_address=containerinstance.IpAddressArgs(
                                                       ports=[containerinstance.PortArgs(
                                                           port=80,
                                                           protocol="Tcp",
                                                       )],
                                                       type="Public",
                                                   ),
                                                   restart_policy="always",
                                                   )

pulumi.export("containerIPv4Address", container_group.ip_address.apply(lambda ip: ip.ip))
pulumi.export("myContainerIpv4Address", my_container_group.ip_address.apply(lambda ip: ip.ip))
