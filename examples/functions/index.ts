// Copyright 2016-2021, Pulumi Corporation.  All rights reserved.

import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as web from "@pulumi/azure-native/web";
import * as pulumi from "@pulumi/pulumi";

// Create a resource group for Windows App Service Plan
const resourceGroup = new resources.ResourceGroup("windowsrg");

const storageAccount = new storage.StorageAccount("functionsa", {
    resourceGroupName: resourceGroup.name,
    kind: storage.Kind.StorageV2,
    sku: {
        name: storage.SkuName.Standard_LRS,
    },
});

const plan = new web.AppServicePlan("windows-plan", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Y1",
        tier: "Dynamic",
    },
});

const container = new storage.BlobContainer("container", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    publicAccess: storage.PublicAccess.None,
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

const powershellBlob = new storage.Blob("powershellBlob", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    source: new pulumi.asset.FileArchive("./powershell"),
});

const powershellBlobSignedURL = signedBlobReadUrl(powershellBlob, container, storageAccount, resourceGroup);

const powershellApp = new web.WebApp("httppowershell", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: plan.id,
    kind: "FunctionApp",
    siteConfig: {
        appSettings: [
            { name: "runtime", value: "powershell" },
            { name: "FUNCTIONS_WORKER_RUNTIME", value: "powershell" },
            { name: "WEBSITE_RUN_FROM_PACKAGE", value: powershellBlobSignedURL },
            { name: "FUNCTIONS_EXTENSION_VERSION", value: "~3" },
        ],
    },
});

// Create a dedicated resource group for Linux App Service Plan - require for Python
const linuxResourceGroup = new resources.ResourceGroup("linuxrg");

// Python Function App won't run on Windows Consumption Plan, so we create a Linux Consumption Plan instead
const linuxPlan = new web.AppServicePlan("linux-asp", {
    resourceGroupName: linuxResourceGroup.name,
    kind: "Linux",
    sku: {
        name: "Y1",
        tier: "Dynamic",
    },
    reserved: true,
});

const pythonBlob = new storage.Blob("pythonBlob", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: container.name,
    source: new pulumi.asset.FileArchive("./python"),
});

const pythonBlobSignedURL = signedBlobReadUrl(pythonBlob, container, storageAccount, resourceGroup);

const pythonApp = new web.WebApp("httppython", {
    resourceGroupName: resourceGroup.name,
    serverFarmId: linuxPlan.id,
    kind: "FunctionApp",
    siteConfig: {
        appSettings: [
            { name: "runtime", value: "python" },
            { name: "FUNCTIONS_WORKER_RUNTIME", value: "python" },
            { name: "WEBSITE_RUN_FROM_PACKAGE", value: pythonBlobSignedURL },
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


export const nodeEndpoint = nodeApp.defaultHostName.apply(ep => `https://${ep}/api/HelloNode?name=Pulumi`);
export const powershellEndpoint = powershellApp.defaultHostName.apply(ep => `https://${ep}/api/HelloPS?name=Pulumi`);
export const pythonEndpoint = pythonApp.defaultHostName.apply(ep => `https://${ep}/api/HelloPython?name=Pulumi`);
