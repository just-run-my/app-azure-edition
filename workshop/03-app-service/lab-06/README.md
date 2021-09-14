# Step 6 &mdash; Run `pulumi up`

Now we've defined our webapp, we can again use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory. You should see something like this:

```bash
pulumi up
Previewing update (dev)

View Live: https://app.pulumi.com/jaxxstorm/my-first-azure-app/dev/previews/a2c2c717-ac1d-4847-908c-3b820312a91f

     Type                                        Name                    Plan
     pulumi:pulumi:Stack                         my-first-azure-app-dev
 +   ├─ docker:image:Image                       app                     create
 +   ├─ azure-native:containerregistry:Registry  registry                create
 +   ├─ azure-native:web:AppServicePlan          plan                    create
 +   └─ azure-native:web:WebApp                  app                     create

Resources:
    + 4 to create
    6 unchanged

Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
  yes
> no
  details
```

You'll notice, the existing infrastructure (ie our static site in our bucket) remains unchanged. Let's deploy this but hitting yes

## Step 4 &mdash; Export the URL

Like our static site before it, we need to export the URL so we can examine our site. Let's do this now.

Add the following to the bottom of your `index.ts`:

```typescript
export const webAppUrl = pulumi.interpolate`https://${app.defaultHostName}`;
```

Rerun your `pulumi up` and you'll see a new field:

```
Outputs:
  + webAppUrl: "https://app8570cf33.azurewebsites.net"
```

Check out the result!

```
curl $(pulumi stack output webAppUrl)
```
