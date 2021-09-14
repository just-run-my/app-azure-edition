## Step 1 &mdash; Create a Resource Group

We'll first create an Azure resource group, which will be used for all the other resources we're going to provision. Add the following to your imports at the top of your `index.ts` file like so:

```typescript
import * as resources from "@pulumi/azure-native/resources";
```

Next, create your resourceGroup. In Pulumi, this is done by creating a constant, and assigning the resourceGroup resource to that constant, like so:

```typescript
const resourceGroup = new resources.ResourceGroup("aks-app")
```

> At this stage, your `index.ts` file should look like this:

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";

const resourceGroup = new resources.ResourceGroup("aks-app")
```

# Next Steps

* [Create a private key](../lab-02/README.md)