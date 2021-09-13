# Copyright 2016-2021, Pulumi Corporation.  All rights reserved.

import base64

import pulumi
from pulumi_azure_native import resources, containerservice
import pulumi_tls as tls

config = pulumi.Config()

# Create new resource group
resource_group = resources.ResourceGroup("azure-native-py-aks")

# Generate an SSH key
ssh_key = tls.PrivateKey("ssh-key", algorithm="RSA", rsa_bits=4096)

# Create cluster
managed_cluster_name = config.get("managedClusterName")
if managed_cluster_name is None:
    managed_cluster_name = "azure-native-aks"

managed_cluster = containerservice.ManagedCluster(
    managed_cluster_name,
    resource_group_name=resource_group.name,
    agent_pool_profiles=[{
        "count": 3,
        "max_pods": 110,
        "mode": "System",
        "name": "agentpool",
        "node_labels": {},
        "os_disk_size_gb": 30,
        "os_type": "Linux",
        "type": "VirtualMachineScaleSets",
        "vm_size": "Standard_DS2_v2",
    }],
    enable_rbac=True,
    kubernetes_version="1.21.1",
    linux_profile={
        "admin_username": "testuser",
        "ssh": {
            "public_keys": [{
                "key_data": ssh_key.public_key_openssh,
            }],
        },
    },
    dns_prefix=resource_group.name,
    node_resource_group=f"MC_azure-native-go_{managed_cluster_name}_westus",
    identity={
        "type": "SystemAssigned",
    })

creds = pulumi.Output.all(resource_group.name, managed_cluster.name).apply(
    lambda args:
    containerservice.list_managed_cluster_user_credentials(
        resource_group_name=args[0],
        resource_name=args[1]))

# Export kubeconfig
encoded = creds.kubeconfigs[0].value
kubeconfig = encoded.apply(
    lambda enc: base64.b64decode(enc).decode())
pulumi.export("kubeconfig", kubeconfig)
