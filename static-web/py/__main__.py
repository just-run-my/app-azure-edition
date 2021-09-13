"""An Azure RM Python Pulumi program"""

import pulumi
import os
from pulumi_azure_native import storage
from pulumi_azure_native import resources

# Create an Azure Resource Group
resource_group = resources.ResourceGroup('rg')

# Create an Azure resource (Storage Account)
account = storage.StorageAccount('websitesa',
    resource_group_name=resource_group.name,
    sku=storage.SkuArgs(
        name=storage.SkuName.STANDARD_LRS,
    ),
    kind=storage.Kind.STORAGE_V2)

static_website = storage.StorageAccountStaticWebsite("staticsite",
                                                     resource_group_name=resource_group.name,
                                                     account_name=account.name,
                                                     index_document="index.html",
                                                     error404_document="404.html")

content_dir = "../wwwroot"
for file in os.listdir(content_dir):
    filepath = os.path.join(content_dir, file)
    obj = storage.Blob(
        file,
        resource_group_name=resource_group.name,
        account_name=account.name,
        container_name=static_website.container_name,
        source=pulumi.FileAsset(filepath),
        content_type="text/html",
    )

pulumi.export("static_endpoint", account.primary_endpoints.web)
