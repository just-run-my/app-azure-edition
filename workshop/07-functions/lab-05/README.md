export const nodeEndpoint = nodeApp.defaultHostName.apply(ep => `https://${ep}/api/HelloNode?name=Pulumi`);# Step 6 &mdash; Run `pulumi up`

Now we've defined our webapp, we can again use the pulumi CLI to create the resources.

Run `pulumi up` within your project directory.

## Step 4 &mdash; Export the URL

Like our static site before it, we need to export the URL so we can examine our site. Let's do this now.

Add the following to the bottom of your `index.ts`:

```typescript
export const nodeEndpoint = nodeApp.defaultHostName.apply(ep => `https://${ep}/api/HelloNode?name=Pulumi`);
```

Rerun your `pulumi up` and you'll see a new output.

Check out the result!

```
curl $(pulumi stack output nodeEndpoint)
```

Next Steps: Add the powershell function ;)
