# Step 2 &mdash; Deploy to ACI

ACI is designed to relatively simple, so deploying our application is also relatively simple. Of course, we need to import the package first.

```typescript
import * as containerinstance from "@pulumi/azure-native/containerinstance";
```

Then, we run our application:

```typescript
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

export const containerIPv4Address = containerGroup.ipAddress.apply(ip => ip?.ip);
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as containerinstance from "@pulumi/azure-native/containerinstance";
import * as resources from "@pulumi/azure-native/resources";

const resourceGroup = new resources.ResourceGroup("aci-ts-rg");

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

export const containerIPv4Address = containerGroup.ipAddress.apply(ip => ip?.ip);
```