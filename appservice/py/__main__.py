import pulumi_azure_native.resources as resource
import pulumi_azure_native.web as web
import pulumi_azure_native.storage as storage
import pulumi

resource_group = resource.ResourceGroup("appservicerg")

storage_account = storage.StorageAccount(
    "appservicesa",
    resource_group_name=resource_group.name,
    kind=storage.Kind.STORAGE_V2,
    sku=storage.SkuArgs(name=storage.SkuName.STANDARD_LRS))

app_service_plan = web.AppServicePlan(
    "appservice-asp",
    resource_group_name=resource_group.name,
    kind="App",
    sku=web.SkuDescriptionArgs(
        tier="Basic",
        name="B1",
    ))

storage_container = storage.BlobContainer(
    "appservice-c",
    account_name=storage_account.name,
    public_access=storage.PublicAccess.NONE,
    resource_group_name=resource_group.name)

blob = storage.Blob(
    "appservice-b",
    resource_group_name=resource_group.name,
    account_name=storage_account.name,
    container_name=storage_container.name,
    type=storage.BlobType.BLOCK,
    source=pulumi.asset.FileArchive("../wwwroot"))


def get_sas(args):
    blob_sas = storage.list_storage_account_service_sas(
        account_name=storage_account.name,
        protocols=storage.HttpProtocol.HTTPS,
        shared_access_start_time="2021-01-01",
        shared_access_expiry_time="2030-01-01",
        resource=storage.SignedResource.C,
        resource_group_name=args[3],
        permissions=storage.Permissions.R,
        canonicalized_resource="/blob/" + args[0] + "/" + args[1],
        content_type="application/json",
        cache_control="max-age=5",
        content_disposition="inline",
        content_encoding="deflate",
    )
    return f"https://{args[0]}.blob.core.windows.net/{args[1]}/{args[2]}?{blob_sas.service_sas_token}"


signed_blob_url = pulumi.Output.all(
    storage_account.name,
    storage_container.name,
    blob.name,
    resource_group.name,
).apply(get_sas)

app = web.WebApp(
    "appservice-as",
    resource_group_name=resource_group.name,
    server_farm_id=app_service_plan.id,
    site_config=web.SiteConfigArgs(
        app_settings=[
            web.NameValuePairArgs(name="WEBSITE_RUN_FROM_PACKAGE", value=signed_blob_url),
        ],
    ),
)

pulumi.export("endpoint", app.default_host_name.apply(
    lambda endpoint: "https://" + endpoint
))
