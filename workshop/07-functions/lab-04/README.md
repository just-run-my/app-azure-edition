# Step 4 &mdash; Add our Functions

To set up the deployment of our functions, we first need a helper func that helps us get a signed url for the blobs where
the function code has been deployed

Add the following to the bottom of your `index.ts`:

```typescript
function signedBlobReadUrl(blob: storage.Blob,
                           container: storage.BlobContainer,
                           account: storage.StorageAccount,
                           resourceGroup: resources.ResourceGroup): pulumi.Output<string> {
    const blobSAS = storage.listStorageAccountServiceSASOutput({
        accountName: account.name,
        protocols: storage.HttpProtocol.Https,
        sharedAccessExpiryTime: "2030-01-01",
        sharedAccessStartTime: "2021-01-01",
        resourceGroupName: resourceGroup.name,
        resource: storage.SignedResource.C,
        permissions: storage.Permissions.R,
        canonicalizedResource: pulumi.interpolate`/blob/${account.name}/${container.name}`,
        contentType: "application/json",
        cacheControl: "max-age=5",
        contentDisposition: "inline",
        contentEncoding: "deflate",
    });
    const token = blobSAS.serviceSasToken;
    return pulumi.interpolate`https://${account.name}.blob.core.windows.net/${container.name}/${blob.name}?${token}`;
}
```

Now we can add the code that takes care of the app deployment to our storage blob and also deploys the storage blob to the
WebApp. Add the following to your `index.ts`:

```typescript
const nodeBlob = new storage.Blob("nodeBlob", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    source: new pulumi.asset.FileArchive("./javascript"),
});

const nodeBlobSignedURL = signedBlobReadUrl(nodeBlob, container, storageAccount, resourceGroup);

const nodeApp = new web.WebApp("httpnode", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: plan.id,
    kind: "FunctionApp",
    siteConfig: {
        appSettings: [
            { name: "runtime", value: "node" },
            { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
            { name: "WEBSITE_RUN_FROM_PACKAGE", value: nodeBlobSignedURL },
            { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~12" },
            { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
        ],
    },
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

const plan = new web.AppServicePlan("windows-plan", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Y1",
        tier: "Dynamic",
    },
});

const nodeBlob = new storage.Blob("nodeBlob", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    source: new pulumi.asset.FileArchive("./javascript"),
});

const nodeBlobSignedURL = signedBlobReadUrl(nodeBlob, container, storageAccount, resourceGroup);

const nodeApp = new web.WebApp("httpnode", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: plan.id,
    kind: "FunctionApp",
    siteConfig: {
        appSettings: [
            { name: "runtime", value: "node" },
            { name: "FUNCTIONS_WORKER_RUNTIME", value: "node" },
            { name: "WEBSITE_RUN_FROM_PACKAGE", value: nodeBlobSignedURL },
            { name: "WEBSITE_NODE_DEFAULT_VERSION", value: "~12" },
            { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
        ],
    },
});

function signedBlobReadUrl(blob: storage.Blob,
                           container: storage.BlobContainer,
                           account: storage.StorageAccount,
                           resourceGroup: resources.ResourceGroup): pulumi.Output<string> {
    const blobSAS = storage.listStorageAccountServiceSASOutput({
        accountName: account.name,
        protocols: storage.HttpProtocol.Https,
        sharedAccessExpiryTime: "2030-01-01",
        sharedAccessStartTime: "2021-01-01",
        resourceGroupName: resourceGroup.name,
        resource: storage.SignedResource.C,
        permissions: storage.Permissions.R,
        canonicalizedResource: pulumi.interpolate`/blob/${account.name}/${container.name}`,
        contentType: "application/json",
        cacheControl: "max-age=5",
        contentDisposition: "inline",
        contentEncoding: "deflate",
    });
    const token = blobSAS.serviceSasToken;
    return pulumi.interpolate`https://${account.name}.blob.core.windows.net/${container.name}/${blob.name}?${token}`;
}
```

# Next Steps

* [Add a container registry](../lab-05/README.md)
