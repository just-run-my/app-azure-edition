# 3 Step 3 &mdash; Add a Container Registry

Now, we need to build a Docker container. One has already been defined for your in the `../wwwroot` directory. We can define a container registry to store our Docker image first. Add the following to your `index.ts`:

```typescript
// Add this to your imports
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const registry = new containerregistry.Registry("registry", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Basic",
    },
    adminUserEnabled: true,
})
```

Now, we need to retrieve our credentials from this created registry. We need to only grab these credentials once the registry has been created. Pulumi has a mechanism for this, an `apply()` call. We can chain multiple `apply()` calls with `.all()`. Add the following to your `index.ts`:

```typescript
// grab the registry credentials using `listRegistryCredentials
const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(
    ([resourceGroupName, registryName]) => containerregistry.listRegistryCredentials({
        resourceGroupName: resourceGroupName,
        registryName: registryName,
}));

// assign the retrieved values to constants once they are resolved
const adminUsername = credentials.apply(credentials => credentials.username!);
const adminPassword = credentials.apply(credentials => credentials.passwords![0].value!);
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as web from "@pulumi/azure-native/web";
import * as containerregistry from "@pulumi/azure-native/containerregistry";

const resourceGroup = new resources.ResourceGroup("appservice-app")

const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
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
```

# Next Steps

* [Build and push your docker image](../lab-04/README.md)
