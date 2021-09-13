package main

import (
	"fmt"

	"github.com/pulumi/pulumi-azure-native/sdk/go/azure/resources"
	"github.com/pulumi/pulumi-azure-native/sdk/go/azure/storage"
	"github.com/pulumi/pulumi-azure-native/sdk/go/azure/web"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		resourceGroup, err := resources.NewResourceGroup(ctx, "appservice-rg", nil)
		if err != nil {
			return err
		}

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

		noPublicAccess := storage.PublicAccessNone
		container, err := storage.NewBlobContainer(ctx, "container", &storage.BlobContainerArgs{
			ResourceGroupName: resourceGroup.Name,
			AccountName: account.Name,
			PublicAccess: &noPublicAccess,
		})
		if err != nil {
			return err
		}

		blob, err := storage.NewBlob(ctx, "blob", &storage.BlobArgs{
			ResourceGroupName: resourceGroup.Name,
			AccountName: account.Name,
			ContainerName: container.Name,
			Source: pulumi.NewFileArchive("../wwwroot"),
		})
		if err != nil {
			return err
		}

		codeBlobUrl := pulumi.All(account.Name, container.Name, blob.Name, resourceGroup.Name).ApplyT(
			func (args []interface{}) string {
				return getSASToken(ctx, args[0].(string), args[1].(string), args[2].(string), args[3].(string))
			},
		).(pulumi.StringOutput)

		plan, err := web.NewAppServicePlan(ctx, "plan", &web.AppServicePlanArgs{
			ResourceGroupName: resourceGroup.Name,
			Kind:              pulumi.String("Linux"),
			Sku: &web.SkuDescriptionArgs{
				Name: pulumi.String("B1"),
				Tier: pulumi.String("Basic"),
			},
		})
		if err != nil {
			return err
		}

		app, err := web.NewWebApp(ctx, "webapp", &web.WebAppArgs{
			ResourceGroupName: resourceGroup.Name,
			ServerFarmId:      plan.ID(),
			SiteConfig: &web.SiteConfigArgs{
				AppSettings: web.NameValuePairArray{
					&web.NameValuePairArgs{
						Name:  pulumi.String("WEBSITE_RUN_FROM_PACKAGE"),
						Value: codeBlobUrl,
					},
				},
			},
		})
		if err != nil {
			return err
		}

		ctx.Export("endpoint", app.DefaultHostName.ApplyT(func(defaultHostName string) (string, error) {
			return fmt.Sprintf("%v%v", "https://", defaultHostName), nil
		}).(pulumi.StringOutput))

		return nil
	})
}

func getSASToken(ctx *pulumi.Context, storageAccountName, storageContainerName, blobName, resourceGroupName string) string {
	protocol := "https"
	startTime := "2021-01-01"
	endTime := "2030-01-01"
	resourceType := "c"
	permission := "r"
	contentType := "application/json"
	cacheControl := "max-age=5"
	contentDisposition := "inline"
	contentEncoding := "deflate"
	blobSas, err := storage.ListStorageAccountServiceSAS(ctx, &storage.ListStorageAccountServiceSASArgs{
		AccountName: storageAccountName,
		Protocols: &protocol,
		SharedAccessStartTime: &startTime,
		SharedAccessExpiryTime: &endTime,
		Resource: &resourceType,
		ResourceGroupName: resourceGroupName,
		Permissions: &permission,
		CanonicalizedResource: fmt.Sprintf("/blob/%s/%s", storageAccountName, storageContainerName),
		ContentType: &contentType,
		CacheControl: &cacheControl,
		ContentDisposition: &contentDisposition,
		ContentEncoding: &contentEncoding,
	})
	if err != nil {
		return ""
	}

	return fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s?%s", storageAccountName, storageContainerName, blobName, blobSas.ServiceSasToken)
}
