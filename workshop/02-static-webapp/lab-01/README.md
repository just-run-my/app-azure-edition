## Step 1 &mdash; Create a Resource Group

We need to have a new pulumi azure project in place for the following steps. I support `pulumi new azure-typescript`

In order to get a location for the resources, we need to ensure that the provider is configured with a default location. This location will then
be used to create  all the resources in:

```bash
pulumi config set azure-native:location eastus
```

Next, we'll create an Azure resource group, which will be used for all the other resources we're going to provision. Add the following to your imports at the top of your `index.ts` file like so:

```typescript
import * as resources from "@pulumi/azure-native/resources";
```

Next, define your resourceGroup. In Pulumi, this is done by creating a constant, and assigning the resourceGroup resource to that constant, like so:

```typescript
const resourceGroup = new resources.ResourceGroup("static-webapp")
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";

const resourceGroup = new resources.ResourceGroup("static-webapp")
```

# Next Steps

* [Create your storage account](../lab-02/README.md)
