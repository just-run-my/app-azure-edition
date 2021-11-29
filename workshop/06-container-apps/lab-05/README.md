## Step 5 &mdash; Deploy your WebApp

Now, we need to actually deploy this Docker container. We'll use Azure's [Container Apps](https://azure.microsoft.com/en-us/services/container-apps/) service for this.

Our final import will be the web resource. Add the following to your imports:

```typescript
import * as web from "@pulumi/azure-native/web/v20210301";
```

And then define your webapp, like so:

```typescript
const kubeEnv = new web.KubeEnvironment("env", {
    resourceGroupName: resourceGroup.name,
    type: "Managed",
    appLogsConfiguration: {
        destination: "log-analytics",
        logAnalyticsConfiguration: {
            customerId: workspace.customerId,
            sharedKey: workspaceSharedKeys.apply(r => r.primarySharedKey!),
        },
    },
});

const containerApp = new web.ContainerApp("app", {
    resourceGroupName: resourceGroup.name,
    kubeEnvironmentId: kubeEnv.id,
    configuration: {
        ingress: {
            external: true,
            targetPort: 80,
        },
        registries: [{
            server: registry.loginServer,
            username: adminUsername,
            passwordSecretRef: "pwd",
        }],
        secrets: [{
            name: "pwd",
            value: adminPassword,
        }],
    },
    template: {
        containers: [{
            name: "myapp",
            image: myImage.imageName,
        }],
    },
});
```

> At this stage, your `index.ts` should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import * as resources from "@pulumi/azure-native/resources";
import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import * as containerregistry from "@pulumi/azure-native/containerregistry";

import * as web from "@pulumi/azure-native/web/v20210301";

const resourceGroup = new resources.ResourceGroup("appservice-app")

const workspace = new operationalinsights.Workspace("loganalytics", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "PerGB2018",
    },
    retentionInDays: 30,
});

const workspaceSharedKeys = operationalinsights.getSharedKeysOutput({
    resourceGroupName: resourceGroup.name,
    workspaceName: workspace.name,
});

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

const customImage = "node-app";
const myImage = new docker.Image(customImage, {
    imageName: pulumi.interpolate`${registry.loginServer}/${customImage}:v1.0.0`,
    build: { context: `../${customImage}` },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});

const kubeEnv = new web.KubeEnvironment("env", {
    resourceGroupName: resourceGroup.name,
    type: "Managed",
    appLogsConfiguration: {
        destination: "log-analytics",
        logAnalyticsConfiguration: {
            customerId: workspace.customerId,
            sharedKey: workspaceSharedKeys.apply(r => r.primarySharedKey!),
        },
    },
});

const containerApp = new web.ContainerApp("app", {
    resourceGroupName: resourceGroup.name,
    kubeEnvironmentId: kubeEnv.id,
    configuration: {
        ingress: {
            external: true,
            targetPort: 80,
        },
        registries: [{
            server: registry.loginServer,
            username: adminUsername,
            passwordSecretRef: "pwd",
        }],
        secrets: [{
            name: "pwd",
            value: adminPassword,
        }],
    },
    template: {
        containers: [{
            name: "myapp",
            image: myImage.imageName,
        }],
    },
});
```

# Next Steps

* [Provision your infrastructure](../lab-06/README.md)
