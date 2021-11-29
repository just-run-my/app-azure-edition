using System.IO;
using Pulumi;
using Pulumi.AzureNative.Resources;
using Pulumi.AzureNative.Storage;
using Pulumi.AzureNative.Storage.Inputs;
using Pulumi.AzureNative.Storage.Outputs;

class MyStack : Stack
{
    public MyStack()
    {
        // Create an Azure Resource Group
        var resourceGroup = new ResourceGroup("resourceGroup");

        // Create an Azure resource (Storage Account)
        var account = new StorageAccount("sa", new StorageAccountArgs
        {
            ResourceGroupName = resourceGroup.Name,
            Sku = new SkuArgs
            {
                Name = SkuName.Standard_LRS
            },
            Kind = Kind.StorageV2
        });

        var staticWebsite = new StorageAccountStaticWebsite("staticsite", new StorageAccountStaticWebsiteArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AccountName = account.Name,
            IndexDocument = "index.html",
            Error404Document = "404.html",
        });

        var files = Directory.GetFiles("../wwwroot");
        foreach (var file in files)
        {
            var name = Path.GetFileName(file);
            var objDetails = new Blob(name, new BlobArgs
            {
                ResourceGroupName = resourceGroup.Name,
                AccountName = account.Name,
                ContainerName = staticWebsite.ContainerName,
                Source = new FileAsset(file),
                ContentType = "text/html",
            });
        }

        this.StaticEndpoint = account.PrimaryEndpoints.Apply(primaryEndpoints => primaryEndpoints.Web);
    }

    [Output]
    public Output<string> StaticEndpoint { get; set; }
}
