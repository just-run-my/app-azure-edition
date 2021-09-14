## Step 3 &mdash; Create an AKS cluster

Now that our prerequisites are met, we can start to create our infrastructure that'll run our application.

Of course, we need to import a dependency for this on the AKS resources in Azure. Update your `index.ts` to add the `containerservice` resources:

```typescript
import * as containerservice from "@pulumi/azure-native/containerservice";
```

Next, we'll declare a managed AKS cluster:

```typescript
const cluster = new containerservice.ManagedCluster('aksCluster', {
    resourceGroupName: resourceGroup.name,
    agentPoolProfiles: [{
        count: 3,
        maxPods: 110,
        mode: "System",
        name: "agentpool",
        nodeLabels: {},
        osDiskSizeGB: 30,
        osType: "Linux",
        type: "VirtualMachineScaleSets",
        vmSize: "Standard_DS2_v2",
    }],
    dnsPrefix: resourceGroup.name,
    enableRBAC: true,
    kubernetesVersion: "1.21.1",
    linuxProfile: {
        adminUsername: "testuser",
        ssh: {
            publicKeys: [{
                keyData: sshKey.publicKeyOpenssh,
            }],
        },
    },
    nodeResourceGroup: `MC_azure-ts_akscluster`,
    identity: {
        type: "SystemAssigned",
    }
});
```

Finally, we'll need to export our `KUBECONFIG` so we can access our cluster.

We need to do some conversion of the string we get _after_ it's been resolved by Pulumi. In order to do this, we'll use Pulumi's `.apply` mechanism.

```typescript
const creds = pulumi.all([cluster.name, resourceGroup.name]).apply(([clusterName, rgName]) => {
    return containerservice.listManagedClusterUserCredentials({
        resourceGroupName: rgName,
        resourceName: clusterName,
    });
});

const encoded = creds.kubeconfigs[0].value;
export const kubeconfig = encoded.apply(enc => Buffer.from(enc, "base64").toString());
```

> At this stage, your `index.ts` should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

import * as containerservice from "@pulumi/azure-native/containerservice";
import * as resources from "@pulumi/azure-native/resources";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("azure-go-aks");

const sshKey = new tls.PrivateKey("ssh-key", {
    algorithm: "RSA",
    rsaBits: 4096,
});

const cluster = new containerservice.ManagedCluster(`aksCluster`, {
    resourceGroupName: resourceGroup.name,
    agentPoolProfiles: [{
        count: 3,
        maxPods: 110,
        mode: "System",
        name: "agentpool",
        nodeLabels: {},
        osDiskSizeGB: 30,
        osType: "Linux",
        type: "VirtualMachineScaleSets",
        vmSize: "Standard_DS2_v2",
    }],
    dnsPrefix: resourceGroup.name,
    enableRBAC: true,
    kubernetesVersion: "1.21.1",
    linuxProfile: {
        adminUsername: "testuser",
        ssh: {
            publicKeys: [{
                keyData: sshKey.publicKeyOpenssh,
            }],
        },
    },
    nodeResourceGroup: `MC_azure-ts_aksCluster`,
    identity: {
        type: "SystemAssigned",
    }
});

const creds = pulumi.all([cluster.name, resourceGroup.name]).apply(([clusterName, rgName]) => {
    return containerservice.listManagedClusterUserCredentials({
        resourceGroupName: rgName,
        resourceName: clusterName,
    });
});

const encoded = creds.kubeconfigs[0].value;
export const kubeconfig = encoded.apply(enc => Buffer.from(enc, "base64").toString());
```

# Next Steps

* [Deploy your application](../lab-04/README.md)