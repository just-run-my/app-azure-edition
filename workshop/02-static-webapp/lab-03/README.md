## Step 3 &mdash; Create your Static Website

Now we need to add a new resource, a `StorageAccountStaticWebsite`. This is a similar process to before, so let's populate this resource:

Add the following to your `index.ts`:

```typescript
const staticWebsite = new storage.StorageAccountStaticWebsite("myFirstApp", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html",
    error404Document: "404.html",
});
```

## Step 4 &mdash; Upload your Static Files

Let's create a `wwwroot` folder in our Pulumi application root:

```bash
mkdir wwwroot
```

In that `wwwroot` folder , we are going to create an `index.html` file and a `404.html` file:

```index.html
<!DOCTYPE html>
<html lang="en">
<body>
<h1>Hello from Pulumi!!!</h1>
</body>
</html>
```

```404.html
<!DOCTYPE html>
<html lang="en">
<body>
<h1>Page Not Found</h1>
</body>
</html>
```

Our final step for our static website is to upload the files above to it. In the previous step, we added a `StorageAccountStaticWebsite`. We can now upload some files to this using the container property.

Because Pulumi is using `TypeScript`, we can use familiar mechanisms like loops, so let's loop through all the files in our sample app and upload them.

Add the following to your `index.ts` file:

```typescript
["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`wwwroot/${name}`),
      contentType: "text/html",
    })
);
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";

const resourceGroup = new resources.ResourceGroup("app");

const storageAccount = new storage.StorageAccount("app", {
  enableHttpsTrafficOnly: true,
  kind: storage.Kind.StorageV2,
  resourceGroupName: resourceGroup.name,
  sku: {
    name: storage.SkuName.Standard_LRS,
  },
});

const staticWebsite = new storage.StorageAccountStaticWebsite("app", {
  accountName: storageAccount.name,
  resourceGroupName: resourceGroup.name,
  indexDocument: "index.html",
  error404Document: "404.html",
});

["index.html", "404.html"].map(
  (name) =>
    new storage.Blob(name, {
      resourceGroupName: resourceGroup.name,
      accountName: storageAccount.name,
      containerName: staticWebsite.containerName,
      source: new pulumi.asset.FileAsset(`../wwwroot/${name}`),
      contentType: "text/html",
    })
);

```

## Step 4 &mdash; Run `pulumi up`

Now we've defined our infrastructure, we use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/my-first-azure-app/dev/previews/0978b65c-1918-43eb-8969-68540516660c

     Type                                                 Name                    Plan
 +   pulumi:pulumi:Stack                                  my-first-azure-app-dev  create
 +   ?????? azure-native:resources:ResourceGroup              app                     create
 +   ?????? azure-native:storage:StorageAccount               app                     create
 +   ?????? azure-native:storage:StorageAccountStaticWebsite  app                     create
 +   ?????? azure-native:storage:Blob                         404.html                create
 +   ?????? azure-native:storage:Blob                         index.html              create

Resources:
    + 6 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You can examine the details of the resources that will be created. When you're happy, move the arrow to `yes` and watch as Pulumi creates your resources!

## Step 4 &mdash; Export the URL

We provisioned our infrastructure, but we don't actually know where it is. We can `export` values from our Pulumi stack so we can see the resolved `Output`.

Add the following to the bottom of your `index.ts`:

```typescript
// Web endpoint to the website
export const url = storageAccount.primaryEndpoints.web;
```

Rerun your `pulumi up` and you'll see a new field:

```
Outputs:
    url: "https://app793a46fd.z22.web.core.windows.net/"
```

Check out the website!

```
curl $(pulumi stack output url)
```
