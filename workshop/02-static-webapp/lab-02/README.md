## Step 2 &mdash; Create a Storage Account

Now we have the resourceGroup created, we can now add an Azure storage account to store our HTML content for our static site. 

We'll need to import the storage resources first, so add the following to your imports, near the top of your `index.ts`:

```typescript
import * as storage from "@pulumi/azure-native/storage";
```

Now, we can use this import to create a storage account

```typescript
const storageAccount = new storage.StorageAccount("app", {
    enableHttpsTrafficOnly: true,
    kind: storage.Kind.StorageV2,
    resourceGroupName: resourceGroup.name,
    sku: {
        name: storage.SkuName.Standard_LRS
    }
});
```
You'll notice that we can use Pulumi's enums support here to populate values, no need to look up the allowed values!