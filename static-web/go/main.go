package main

import (
	"io/ioutil"
	"path/filepath"

	"github.com/pulumi/pulumi-azure-native/sdk/go/azure/resources"
	"github.com/pulumi/pulumi-azure-native/sdk/go/azure/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create an Azure Resource Group
		resourceGroup, err := resources.NewResourceGroup(ctx, "resourceGroup", nil)
		if err != nil {
			return err
		}

		// Create an Azure resource (Storage Account)
		account, err := storage.NewStorageAccount(ctx, "sa", &storage.StorageAccountArgs{
			ResourceGroupName: resourceGroup.Name,
			Sku: &storage.SkuArgs{
				Name: storage.SkuName_Standard_LRS,
			},
			Kind: storage.KindStorageV2,
		})
		if err != nil {
			return err
		}

		website, err := storage.NewStorageAccountStaticWebsite(ctx, "staticsite", &storage.StorageAccountStaticWebsiteArgs{
			ResourceGroupName: resourceGroup.Name,
			AccountName: account.Name,
			IndexDocument: pulumi.String("index.html"),
			Error404Document: pulumi.String("404.html"),
		})
		if err != nil {
			return err
		}

		siteRoot := "../wwwroot"
		files, err := ioutil.ReadDir(siteRoot)
		if err != nil {
			return err
		}

		for _, file := range files {
			_, err := storage.NewBlob(ctx, file.Name(), &storage.BlobArgs{
				ResourceGroupName: resourceGroup.Name,
				AccountName: account.Name,
				ContainerName: website.ContainerName,
				Source: pulumi.NewFileAsset(filepath.Join(siteRoot, file.Name())),
				ContentType: pulumi.String("text/html"),
			})
			if err != nil {
				return err
			}
		}

		ctx.Export("staticEndpoint", account.PrimaryEndpoints.Web())

		return nil
	})
}
