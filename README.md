# Just Run my App - Azure Edition

This repo provides examples and a workshop for running your application in Azure.

The workshop is a guided tour through all the different options to run your application, including the getting started workshop with Pulumi.

See [examples] for examples in each language!

# Workshop

If you'd like to open the [workshop](workshop/) in a preconfigured environment, you can open it with GitPod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/just-run-my/app-azure-edition)

## Installing Prerequisites

The hands-on workshop will walk you through various tasks of managing Azure infrastructure with a focus on how to get your application running. The prerequisites listed below are required to successfully complete them.

### Node.js

You will need Node.js version 14 or later to run Pulumi programs written in [TypeScript](https://www.typescriptlang.org/).
Install your desired LTS version from [the Node.js download page](https://nodejs.org/en/download/) or
[using a package manager](https://nodejs.org/en/download/package-manager/).

After installing, verify that Node.js is working:

```bash
$ node --version
v14.17.0
```

Also verify that the Node Package Manager (NPM) is working:

```bash
$ npm --version
6.14.13
```

### Azure Subscription and CLI

You need an active Azure subscription to deploy the components of the application. You may use your developer subscription, or create a free Azure subscription [here](https://azure.microsoft.com/free/).

Please be sure to have administrative access to the subscription.

You will also use the command-line interface (CLI) tool to log in to an Azure subscription. You can install the CLI tool, as described [here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

After you complete the installation, open a command prompt and type `az`. You should see the welcome message:

```
$ az
     /\
    /  \    _____   _ _  ___ _
   / /\ \  |_  / | | | \'__/ _\
  / ____ \  / /| |_| | | |  __/
 /_/    \_\/___|\__,_|_|  \___|


Welcome to the cool new Azure CLI!
```

### Pulumi

You will use Pulumi to depoy infrastructure changes using code. [Install Pulumi here](https://www.pulumi.com/docs/get-started/install/). After installing the CLI, verify that it is working:

```bash
$ pulumi version
v3.18.1
```

The Pulumi CLI will ask you to login to your Pulumi account as needed. If you prefer to signup now, [go to the signup page](http://app.pulumi.com/signup). Multiple identity provider options are available &mdash; email, GitHub, GitLab, or Atlassian &mdash; and each of them will work equally well for these labs.


