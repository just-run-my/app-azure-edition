# Step 6 &mdash; Run `pulumi up`

Now we've defined our webapp, we can again use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```bash
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/aci-go/dev/previews/a2c2c717-ac1d-4847-908c-3b820312a91f

     Type                                              Name                    Plan
     pulumi:pulumi:Stack                               my-first-azure-app-dev
 +   ├─ azure-native:resources:ResourceGroup           aci-rg             created
 +   └─ azure-native:containerinstance:ContainerGroup  helloworld         created

Resources:
    + 3 to create

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You'll notice, the existing infrastructure (ie our static site in our bucket) remains unchanged. Let's deploy this but hitting yes

## Step 4 &mdash; Checkout the result

Check out the result!

```
curl $(pulumi stack output webAppUrl)
```
