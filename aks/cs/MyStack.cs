using System;
using System.Text;
using System.Threading.Tasks;
using Pulumi;
using Pulumi.AzureNative.ContainerService;
using Pulumi.AzureNative.ContainerService.Inputs;
using Pulumi.AzureNative.Resources;
using Pulumi.Tls;
using ResourceIdentityType = Pulumi.AzureNative.Resources.ResourceIdentityType;

class MyStack : Stack
{
    public MyStack()
    {
        // Create an Azure Resource Group
        var resourceGroup = new ResourceGroup("azure-cs-aks");
        
        // Generate an SSH key
        var sshKey = new PrivateKey("ssh-key", new PrivateKeyArgs
        {
            Algorithm = "RSA",
            RsaBits = 4096
        });
        
        var cluster = new ManagedCluster("my-aks", new ManagedClusterArgs
        {
            ResourceGroupName = resourceGroup.Name,
            AgentPoolProfiles = 
            {
                new ManagedClusterAgentPoolProfileArgs
                {
                    Count = 3,
                    MaxPods = 110,
                    Mode = "System",
                    Name = "agentpool",
                    OsDiskSizeGB = 30,
                    OsType = "Linux",
                    Type = "VirtualMachineScaleSets",
                    VmSize = "Standard_DS2_v2",
                }
            },
            DnsPrefix = "AzureNativeprovider",
            EnableRBAC = true,
            KubernetesVersion = "1.21.1",
            LinuxProfile = new ContainerServiceLinuxProfileArgs
            {
                AdminUsername = "testuser",
                Ssh = new ContainerServiceSshConfigurationArgs
                {
                    PublicKeys = 
                    {
                        new ContainerServiceSshPublicKeyArgs
                        {
                            KeyData = sshKey.PublicKeyOpenssh,
                        }
                    }
                }
            },
            NodeResourceGroup = $"MC_azure-cs_my_aks",
            Identity = new ManagedClusterIdentityArgs
            {
                Type = Pulumi.AzureNative.ContainerService.ResourceIdentityType.SystemAssigned,
            }
        });

        // Export the KubeConfig
        this.KubeConfig = Output.Tuple(resourceGroup.Name, cluster.Name).Apply(names =>
            GetKubeConfig(names.Item1, names.Item2));
    }

    [Output]
    public Output<string> KubeConfig { get; set; }

    private static async Task<string> GetKubeConfig(string resourceGroupName, string clusterName)
    {
        var credentials = await ListManagedClusterUserCredentials.InvokeAsync(new ListManagedClusterUserCredentialsArgs
        {
            ResourceGroupName = resourceGroupName,
            ResourceName = clusterName
        });
        var encoded = credentials.Kubeconfigs[0].Value;
        var data = Convert.FromBase64String(encoded);
        return Encoding.UTF8.GetString(data);
    }
}
