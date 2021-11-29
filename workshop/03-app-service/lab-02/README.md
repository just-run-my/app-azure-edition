# Step 2 &mdash; Create an App Service Plan

We need to add an [App Service Plan](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans) to our resourceGroup. Before we do that, we need to add an additional import.

Add the following to the top of your `index.ts` with your other imports:

```typescript
import * as web from "@pulumi/azure-native/web";
```

Then, add the following to your `index.ts`:

```typescript
const plan = new web.AppServicePlan("plan", {
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    reserved: true,
    sku: {
        name: "B1",
        tier: "Basic",
    },
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as web from "@pulumi/azure-native/web";

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
```

# Next Steps

* [Add a container registry](../lab-03/README.md)
