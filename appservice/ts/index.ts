import * as resource from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";

const resourceGroup = new resource.ResourceGroup("rg");

// Storage Account name must be lowercase and cannot have any dash characters
const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    kind: storage.Kind.StorageV2,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
});


const appServicePlan = new web.AppServicePlan("asp", {
    resourceGroupName: resourceGroup.name,
    kind: "App",
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

const storageContainer = new storage.BlobContainer("container", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    publicAccess: storage.PublicAccess.None,
});

const blob = new storage.Blob("blob", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: storageContainer.name,
    source: new pulumi.asset.FileArchive("../wwwroot"),
});

const codeBlobUrl = pulumi.all(
    [storageAccount.name, storageContainer.name, blob.name, resourceGroup.name]).apply(
    args => getSASToken(args[0], args[1], args[2], args[3]));

const app = new web.WebApp("webapp", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: appServicePlan.id,
    siteConfig: {
        appSettings: [
            {
                name: "WEBSITE_RUN_FROM_PACKAGE",
                value: codeBlobUrl,
            },
        ],
    },
});

export const endpoint = pulumi.interpolate `https://${app.defaultHostName}`;

function getSASToken(storageAccountName: string, storageContainerName: string, blobName: string, resourceGroupName: string): pulumi.Output<string> {
    const blobSAS = storage.listStorageAccountServiceSAS({
        accountName: storageAccountName,
        protocols: storage.HttpProtocol.Https,
        sharedAccessStartTime: "2021-01-01",
        sharedAccessExpiryTime: "2030-01-01",
        resource: storage.SignedResource.C,
        resourceGroupName: resourceGroupName,
        permissions: storage.Permissions.R,
        canonicalizedResource: "/blob/" + storageAccountName + "/" + storageContainerName,
        contentType: "application/json",
        cacheControl: "max-age=5",
        contentDisposition: "inline",
        contentEncoding: "deflate",
    });
    return pulumi.interpolate `https://${storageAccountName}.blob.core.windows.net/${storageContainerName}/${blobName}?${blobSAS.then(x => x.serviceSasToken)}`;
}
