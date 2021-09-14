import * as pulumi from "@pulumi/pulumi";
import * as tls from "@pulumi/tls";

import * as containerservice from "@pulumi/azure-native/containerservice";
import * as resources from "@pulumi/azure-native/resources";
import * as k8s from "@pulumi/kubernetes";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("azure-go-aks");

const sshKey = new tls.PrivateKey("ssh-key", {
  algorithm: "RSA",
  rsaBits: 4096,
});

const config = new pulumi.Config();
const managedClusterName = config.get("managedClusterName") || "azure-aks";
const cluster = new containerservice.ManagedCluster(managedClusterName, {
  resourceGroupName: resourceGroup.name,
  agentPoolProfiles: [
    {
      count: 3,
      maxPods: 110,
      mode: "System",
      name: "agentpool",
      nodeLabels: {},
      osDiskSizeGB: 30,
      osType: "Linux",
      type: "VirtualMachineScaleSets",
      vmSize: "Standard_DS2_v2",
    },
  ],
  dnsPrefix: resourceGroup.name,
  enableRBAC: true,
  kubernetesVersion: "1.21.1",
  linuxProfile: {
    adminUsername: "testuser",
    ssh: {
      publicKeys: [
        {
          keyData: sshKey.publicKeyOpenssh,
        },
      ],
    },
  },
  nodeResourceGroup: `MC_azure-go_${managedClusterName}`,
  identity: {
    type: "SystemAssigned",
  },
});

const creds = pulumi
  .all([cluster.name, resourceGroup.name])
  .apply(([clusterName, rgName]) => {
    return containerservice.listManagedClusterUserCredentials({
      resourceGroupName: rgName,
      resourceName: clusterName,
    });
  });

const encoded = creds.kubeconfigs[0].value;
export const kubeconfig = encoded.apply((enc) =>
  Buffer.from(enc, "base64").toString()
);

const appLabels = { app: "kuard" };

const k8sProvider = new k8s.Provider("k8s", {
  kubeconfig: kubeconfig,
});

const ns = new k8s.core.v1.Namespace("ns", {
  metadata: {
    name: "kuard",
  },
}, { provider: k8sProvider });

const app = new k8s.apps.v1.Deployment(
  "deployment",
  {
    metadata: {
      namespace: ns.metadata.name,
    },
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: "kuard",
              image: `gcr.io/kuar-demo/kuard-amd64:blue`,
              ports: [{ containerPort: 8080, name: "http" }],
              livenessProbe: {
                httpGet: { path: "/healthy", port: "http" },
                initialDelaySeconds: 5,
                timeoutSeconds: 1,
                periodSeconds: 10,
                failureThreshold: 3,
              },
              readinessProbe: {
                httpGet: { path: "/ready", port: "http" },
                initialDelaySeconds: 5,
                timeoutSeconds: 1,
                periodSeconds: 10,
                failureThreshold: 3,
              },
            },
          ],
        },
      },
    },
  },
  { provider: k8sProvider, parent: ns }
);

const svc = new k8s.core.v1.Service(`svc`, {
    metadata: {
        namespace: ns.metadata.name
    },
    spec: {
        selector: appLabels,
        ports: [{port: 80, targetPort: 8080}],
        type: "LoadBalancer",
    },
}, {provider: k8sProvider, parent: ns});

const ip = svc.status.loadBalancer.ingress[0].ip
export const url = pulumi.interpolate`http://${ip}`;
