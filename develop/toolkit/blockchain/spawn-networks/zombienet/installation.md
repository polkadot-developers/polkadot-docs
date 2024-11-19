---
title: Installation 
description: Install Zombienet quickly across multiple platforms, including Kubernetes, Podman, and local setups, using executables, Nix, or Docker.
---

# Installation

## Introduction

Zombienet is a robust testing framework designed for Polkadot SDK-based blockchain networks. It enables developers to efficiently deploy and test ephemeral blockchain environments on platforms like Kubernetes, Podman, and native setups. With its simple and versatile CLI, Zombienet provides an all-in-one solution for spawning networks, running tests, and validating performance.

This guide will outline the different installation methods for Zombienet, provide step-by-step instructions for setting up on various platforms, and highlight essential provider-specific features and requirements.

By following this guide, Zombienet will be up and running quickly, ready to streamline your blockchain testing and development workflows.

!!! note "Additional support resources"
    [Parity Technologies](https://www.parity.io/){target=\_blank} has designed and developed this framework, now maintained by the Zombienet team. 

    For further support and information, refer to the following contact points:

    - [Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}
    - [Element public channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=\_blank}

## Install Zombienet

Zombienet releases are available on the [Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}.

Multiple options are available for installing Zombienet, depending on the user's preferences and the environment where it will be used. The following section will guide you through the installation process for each option.

### Using the Executable

Zombienet executables can be downloaded using the latest release uploaded on the [Zombienet repository](https://github.com/paritytech/zombienet/releases){target=\_blank}. You can download the executable for your operating system and architecture and then move it to a directory in your PATH. 

Each release includes executables for Linux and macOS. Executables are generated using [pkg](https://github.com/vercel/pkg){target=\_blank}, which allows the Zombienet CLI to operate without requiring Node.js to be installed. 

Alternatively, you can also download the executable using either `curl` or `wget`:

=== "curl"

        ```bash
        curl -LO \
        https://github.com/paritytech/zombienet/releases/download/INSERT_ZOMBIENET_VERSION/INSERT_ZOMBIENET_EXECUTABLE
        ```

=== "wget"

        ```bash
        wget \
        https://github.com/paritytech/zombienet/releases/download/INSERT_ZOMBIENET_VERSION/INSERT_ZOMBIENET_EXECUTABLE
        ```

!!! note
    - Replace `INSERT_ZOMBIENET_VERSION` with the URL that you want to download
    - Replace `INSERT_ZOMBIENET_EXECUTABLE` with the name of the executable file that matches your operating system and architecture 
    - This guide uses `v{{ dependencies.zombienet.version }}` and `zombienet-{{ dependencies.zombienet.architecture }}`

Then, ensure the downloaded file is executable:

```bash
chmod +x zombienet-{{ dependencies.zombienet.architecture }}
```

Finally, you can run the following command to check if the installation was successful. If so, it will display the version of the installed Zombienet:

```bash
./zombienet-{{ dependencies.zombienet.architecture }} version
```

If you want to add the `zombienet` executable to your PATH, you can move it to a directory in your PATH, such as `/usr/local/bin`:

```bash
mv zombienet-{{ dependencies.zombienet.architecture }} /usr/local/bin/zombienet
```

Now you can refer to the `zombienet` executable directly.

```bash
zombienet version
```

### Using Nix

For Nix users, the Zombienet repository provides a [`flake.nix`](https://github.com/paritytech/zombienet/blob/main/flake.nix){target=\_blank} file to install Zombienet making it easy to incorporate Zombienet into Nix-based projects.
    
To install Zombienet utilizing Nix, users can run the following command, triggering the fetching of the flake and subsequently installing the Zombienet package:

```bash
nix run github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION -- \
spawn INSERT_ZOMBIENET_CONFIG_FILE_NAME.toml
```

!!! note
    - Replace the `INSERT_ZOMBIENET_VERSION` with the desired version of Zombienet
    - Replace the `INSERT_ZOMBIENET_CONFIG_FILE_NAME` with the name of the configuration file you want to use

To run the command above, you need to have [Flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes){target=\_blank} enabled.

Alternatively, you can also include the Zombienet binary in the PATH for the current shell using the following command:
    
```bash
nix shell github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION
```

### Using Docker

Zombienet can also be run using Docker. The Zombienet repository provides a Docker image that can be used to run the Zombienet CLI. To run Zombienet using Docker, you can use the following command:

```bash
docker run -it --rm \
-v $(pwd):/home/nonroot/zombie-net/host-current-files \
paritytech/zombienet
```
The command above will run the Zombienet CLI inside a Docker container and mount the current directory to the `/home/nonroot/zombie-net/host-current-files` directory. This allows Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

Inside the Docker container, you can run the Zombienet CLI commands. First, you need to set up Zombienet to download the necessary binaries:

```bash
npm run zombie -- setup polkadot polkadot-parachain
```

After that, you need to add those binaries to the PATH:

```bash
export PATH=/home/nonroot/zombie-net:$PATH
```

Finally, you can run the Zombienet CLI commands. For example, to spawn a network using a specific configuration file, you can run the following command:

```bash
npm run zombie -- -p native spawn host-current-files/minimal.toml
```

The command above mounts the current directory to the `/workspace` directory inside the Docker container, allowing Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

## Providers

Zombienet supports different backend providers for running the nodes. At this moment, [Kubernetes](https://kubernetes.io/){target=\_blank}, [Podman](https://podman.io/){target=\_blank}, and local providers are supported, which can be declared as `kubernetes`, `podman`, or `native`, respectively.

To use a particular provider, you can specify it in the network file or use the `--provider` flag in the CLI:

```bash
zombienet spawn network.toml --provider INSERT_PROVIDER
```

Alternatively, you can set the provider in the network file:

```toml
[settings]
provider = "INSERT_PROVIDER"
...
```

It's important to note that each provider has specific requirements and associated features. The following sections cover each provider's requirements and added features.

### Kubernetes

Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services. Zombienet is designed to be compatible with a variety of Kubernetes clusters, including: 

- [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine){target=\_blank}
- [Docker Desktop](https://docs.docker.com/desktop/kubernetes/){target=\_blank}
- [kind](https://kind.sigs.k8s.io/){target=\_blank}

#### Requirements
    
To effectively interact with your cluster, you'll need to ensure that [`kubectl`](https://kubernetes.io/docs/reference/kubectl/){target=\_blank} is installed on your system. This Kubernetes command-line tool allows you to run commands against Kubernetes clusters. If you don't have `kubectl` installed, you can follow the instructions provided in the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl){target=\_blank}.

To create resources such as namespaces, pods, and CronJobs within the target cluster, you must grant your user or service account the appropriate permissions. These permissions are essential for managing and deploying applications effectively within Kubernetes.

#### Features
    
If available, Zombienet uses the Prometheus operator to oversee monitoring and visibility. This configuration ensures that only essential networking-related pods are deployed. Using the Prometheus operator, Zombienet improves its ability to monitor and manage network activities within the Kubernetes cluster efficiently.  

### Podman

Podman is a daemonless container engine for developing, managing, and running Open Container Initiative (OCI) containers and container images on Linux-based systems. Zombienet supports Podman rootless as a provider on Linux machines. Although Podman has support for macOS through an internal virtual machine (VM), the Zombienet provider code requires Podman to run natively on Linux.

#### Requirements
     
To use Podman as a provider, you need to have Podman installed on your system. You can install Podman by following the instructions provided on the [Podman website](https://podman.io/getting-started/installation){target=\_blank}.

#### Features
    
Using Podman, Zombienet deploys additional pods to enhance the monitoring and visibility of the active network. Specifically, pods for [Prometheus](https://prometheus.io/){target=\_blank}, [Tempo](https://grafana.com/docs/tempo/latest/operations/monitor/){target=\_blank}, and [Grafana](https://grafana.com/){target=\_blank} are included in the deployment. Grafana is configured with Prometheus and Tempo as data sources.

Upon launching Zombienet, access to these monitoring services is facilitated through specific URLs provided in the output:

- Prometheus - [http://127.0.0.1:34123](http://127.0.0.1:34123){target=\_blank}
- Tempo - [http://127.0.0.1:34125](http://127.0.0.1:34125){target=\_blank}
- Grafana - [http://127.0.0.1:41461](http://127.0.0.1:41461){target=\_blank}

It's important to note that Grafana is deployed with default administrator access. 
    
When network operations cease, either from halting a running spawn with the `Ctrl+C` command or test completion, Zombienet automatically removes all associated pods.

### Local Provider

The Zombienet local provider, also called native, enables you to run nodes as local processes in your environment.

#### Requirements
     
You must have the necessary binaries for your network (such as `polkadot` and `polkadot-parachain`). These binaries should be available in your PATH, allowing Zombienet to spawn the nodes as local processes.

To install the necessary binaries, you can use the Zombienet CLI command:

```bash
zombienet setup polkadot polkadot-parachain
```

This command will download and prepare the necessary binaries for Zombienet's use.

!!! warning
    The `polkadot` and `polkadot-parachain` binaries releases aren't compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=\_blank}, build the Polkadot binary, and manually add it to their PATH for `polkadot` and `polkadot-parachain` to work.

If you need to use a custom binary, ensure the binary is available in your PATH. You can also specify the binary path in the network configuration file. The following example uses the custom [OpenZeppelin template](https://github.com/OpenZeppelin/polkadot-runtime-templates){target=\_blank}:

First, clone the OpenZeppelin template repository using the following command:

```bash
git clone https://github.com/OpenZeppelin/polkadot-runtime-templates \
&& cd polkadot-runtime-templates/generic-template
```

Next, run the command to build the custom binary:

```bash
cargo build --release
```

Finallt, add the custom binary to your PATH as follows:

```bash
export PATH=$PATH:INSERT_PATH_TO_RUNTIME_TEMPLATES/parachain-template-node/target/release
```

Alternatively, you can specify the binary path in the network configuration file.

```toml
[relaychain]
chain = "rococo-local"
default_command = "./bin-v1.6.0/polkadot"

[parachain]
id = 1000

    [parachain.collators]
    name = "collator01"
    command = "./target/release/parachain-template-node"
```

#### Features

The local provider does not offer any additional features.

!!! note
    The local provider exclusively utilizes the command configuration for nodescollators, which supports both relative and absolute paths. You can employ the`default_command` configuration to specify the binary for spawning all nodes inthe relay chain.


