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
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";

const resourceGroup = new resources.ResourceGroup("app");

const storageAccount = new storage.StorageAccount("app", {
  enableHttpsTrafficOnly: true,
  kind: storage.Kind.StorageV2,
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
});

const staticWebsite = new storage.StorageAccountStaticWebsite("app", {
  accountName: storageAccount.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
  error404Document: "404.html",
});

["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      contentType: "text/html",
    })
);

// Web endpoint to the website
export const url = storageAccount.primaryEndpoints.web;

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