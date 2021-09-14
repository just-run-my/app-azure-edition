## Step 3 &mdash; Deploy your application

Now that we have a working AKS cluster, we need to deploy a Kubernetes workload to it.

We'll use Pulumi's Kubernetes provider to do that. 

In your terminal, add the Kubernetes provider to your project:

```bash
npm install @pulumi/kubernetes
```

Then import this into your `index.ts`

```typescript
import * as k8s from "@pulumi/kubernetes";
```

We'll define a Kubernetes deployment and service for our application. First, define the deployment like so:

```typescript
```

Once the deployment is defined, we'll need a `Service` to expose this deployment via a LoadBalancer. Define it like so:

```typescript
```

You'll notice we are also setting a Pulumi `provider` on our resource, so that we know the application is going to the correct Kubernetes cluster (ie the one we defined)

Now all this is done, we can provision our infrastructure:

```bash
pulumi up
```