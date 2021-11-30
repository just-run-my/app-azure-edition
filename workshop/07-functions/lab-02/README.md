# Step 2 &mdash; Add a storage Account

We need to add a storage account to our resourceGroup. Before we do that, we need to add an additional import.

Add the following to the top of your `index.ts` with your other imports:

```typescript
import * as storage from "@pulumi/azure-native/storage";
```

Then, add the following to your `index.ts`:

```typescript
const storageAccount = new storage.StorageAccount("functionsa", {
    resourceGroupName: resourceGroup.name,
    kind: storage.Kind.StorageV2,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
});

const container = new storage.BlobContainer("container", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    publicAccess: storage.PublicAccess.None,
});
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";

const resourceGroup = new resources.ResourceGroup("functions")

const storageAccount = new storage.StorageAccount("functionsa", {
    resourceGroupName: resourceGroup.name,
    kind: storage.Kind.StorageV2,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
});

const container = new storage.BlobContainer("container", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    publicAccess: storage.PublicAccess.None,
});
```

# Next Steps

* [Add a container registry](../lab-03/README.md)
