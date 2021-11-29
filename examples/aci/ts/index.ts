import * as pulumi from "@pulumi/pulumi";
import * as containerinstance from "@pulumi/azure-native/containerinstance";
import * as resources from "@pulumi/azure-native/resources";
import * as containerregistry from "@pulumi/azure-native/containerregistry";
import * as docker from "@pulumi/docker";

const resourceGroup = new resources.ResourceGroup("aci-ts-rg");

const registry = new containerregistry.Registry("registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Basic",
    },
    adminUserEnabled: true,
})

// grab the registry credentials using `listRegistryCredentials
const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(
    ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
    }));

// assign the retrieved values to constants once they are resolved
const adminUsername = credentials.apply(credentials => credentials.username!);
const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);

const image = new docker.Image("app", {
    imageName: pulumi.interpolate`${registry.loginServer}/app:latest`,
    build: { context: `./node-app` },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});

const imageName = "mcr.microsoft.com/azuredocs/aci-helloworld";
const containerGroup = new containerinstance.ContainerGroup("containerGroup", {
    resourceGroupName: resourceGroup.name,
    osType: "Linux",
    containers: [{
        name: "acilinuxpublicipcontainergroup",
        image: imageName,
        ports: [{ port: 80 }],
        resources: {
            requests: {
                cpu: 1.0,
                memoryInGB: 1.5,
            },
        },
    }],
    ipAddress: {
        ports: [{
            port: 80,
            protocol: "Tcp",
        }],
        type: "Public",
    },
    restartPolicy: "always",
});

const myContainerGroup = new containerinstance.ContainerGroup("myContainerGroup", {
    resourceGroupName: resourceGroup.name,
    osType: "Linux",
    imageRegistryCredentials: [{
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    }],
    containers: [{
        name: "my-container-group",
        image: image.imageName,
        ports: [{ port: 80 }],
        resources: {
            requests: {
                cpu: 1.0,
                memoryInGB: 1.5,
            },
        },
    }],
    ipAddress: {
        ports: [{
            port: 80,
            protocol: "Tcp",
        }],
        type: "Public",
    },
    restartPolicy: "always",
});

export const containerIPv4Address = containerGroup.ipAddress.apply(ip => ip?.ip);
export const secondContainerImage = myContainerGroup.ipAddress.apply(ip => ip?.ip);
