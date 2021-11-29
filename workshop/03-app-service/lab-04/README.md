# Step 4 &mdash; Build and Push your Docker Image

Now your registry to store your docker image exists, we need to build our image and push to this registry. First, we'll need to add a new provider, the [Docker Provider](https://www.pulumi.com/docs/intro/cloud-providers/docker/). We do this using the same mechanism we used for the Azure provider earlier, using `npm`:

```bash
npm install @pulumi/docker
```

Then, add the following to your imports:

```typescript
import * as docker from "@pulumi/docker";
```

And finally for this step, define your Docker image resource:

```typescript
const image = new docker.Image("app", {
    imageName: pulumi.interpolate`${registry.loginServer}/app:latest`,
    build: { context: `./node-app` },
    registry: {
        server: registry.loginServer,
        username: adminUsername,
        password: adminPassword,
    },
});
```

# Next Steps

* [Deploy your webapp](../lab-05/README.md)
