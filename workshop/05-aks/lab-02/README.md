## Step 2 &mdash; Create an SSH Private Key

In order to create an AKS cluster, we need to specify an SSH key for the nodes. We'll use Pulumi's `random` provider for that.

First, install the TLS provider:

```bash
npm install @pulumi/tls
```

Then, add the import to your `index.ts`

```typescript
import * as tls from "@pulumi/tls";
```

Finally, declare your SSH key using the TLS provider:

```typescript
const sshKey = new tls.PrivateKey("ssh-key", {
    algorithm: "RSA",
    rsaBits: 4096,
});
```

# Next Steps

* [Create an AKS Cluster](../lab-03/README.md)