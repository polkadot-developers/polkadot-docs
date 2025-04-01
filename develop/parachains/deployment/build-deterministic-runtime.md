---
title: Build a deterministic runtime
description: Explains how to use the Polkadot SDK runtime toolbox and Docker to build deterministic Wasm binaries for Polkadot SDK-based chains.
---

# Build a Deterministic Runtime

## Introduction

By default, the Rust compiler produces optimized Wasm binaries. These binaries are suitable for working in an isolated environment, such as local development. However, the Wasm binaries the compiler builds by default aren't guaranteed to be deterministically reproducible. Each time the compiler generates the Wasm runtime, it might produce a slightly different Wasm byte code. This is problematic in a blockchain network where all nodes must use exactly the same raw chain specification file.

Working with builds that aren't guaranteed to be deterministically reproducible can cause other problems, too. For example, for automating the build processes for a blockchain, it is ideal that the same code always produces the same result (in terms of bytecode). Compiling the Wasm runtime with every push would produce inconsistent and unpredictable results without a deterministic build, making it difficult to integrate with any automation and likely to break a CI/CD pipeline continuously. Deterministic builds—code that always compiles to exactly the same bytecode—ensure that the Wasm runtime can be inspected, audited, and independently verified.

## Prerequisites

Before you begin, ensure you have [Docker](https://www.docker.com/get-started/){target=\_blank} installed.

## Tooling for Wasm Runtime

To compile the Wasm runtime deterministically, the same tooling that produces the runtime for Polkadot, Kusama, and other Polkadot SDK-based chains can be used. This tooling, referred to collectively as the Substrate Runtime Toolbox or [`srtool`](https://github.com/paritytech/srtool){target=\_blank}, ensures that the same source code consistently compiles to an identical Wasm blob.

The core component of `srtool` is a Docker container executed as part of a Docker image. The name of the `srtool` Docker image specifies the version of the Rust compiler used to compile the code included in the image. For example, the image `{{dependencies.repositories.srtool.docker_image_name}}:{{dependencies.repositories.srtool.docker_image_version}}` indicates that the code in the image was compiled with version `{{dependencies.repositories.srtool.docker_image_version}}` of the `rustc` compiler.

## Working with the Docker Container

The [`srtool-cli`](https://github.com/chevdor/srtool-cli){target=\_blank} package is a command-line utility written in Rust that installs an executable program called `srtool`. This program simplifies the interactions with the `srtool` Docker container.

Over time, the tooling around the `srtool` Docker image has expanded to include the following tools and helper programs:

- [**`srtool-cli`**](https://github.com/chevdor/srtool-cli){target=\_blank} - provides a command-line interface to pull the srtool Docker image, get information about the image and tooling used to interact with it, and build the runtime using the `srtool` Docker container
- [**`subwasm`**](https://github.com/chevdor/subwasm){target=\_blank} - provides command-line options for working with the metadata and Wasm runtime built using srtool. The `subwasm` program is also used internally to perform tasks in the `srtool` image
- [**`srtool-actions`**](https://github.com/chevdor/srtool-actions){target=\_blank} - provides GitHub actions to integrate builds produced using the `srtool` image with your GitHub CI/CD pipelines
- [**`srtool-app`**](https://gitlab.com/chevdor/srtool-app){target=\_blank} - provides a simple graphical user interface for building the runtime using the `srtool` Docker image

## Prepare the Environment

It is recommended to install the `srtool-cli` program to work with the Docker image using a simple command-line interface.

To prepare the environment:

1. Verify that Docker is installed by running the following command:

    ```bash
    docker --version
    ```

    If Docker is installed, the command will display version information:

    --8<-- 'code/develop/parachains/deployment/build-deterministic-runtime/deterministic-runtime-1.html'

2. Install the `srtool` command-line interface by running the following command:

    ```bash
    cargo install --git https://github.com/chevdor/srtool-cli
    ```

3. View usage information for the `srtool` command-line interface by running the following command:

    ```bash
    srtool help
    ```

4. Download the latest `srtool` Docker image by running the following command:

    ```bash
    srtool pull
    ```

## Start a Deterministic Build

After preparing the environment, the Wasm runtime can be compiled using the `srtool` Docker image.

To build the runtime, you need to open your Polkadot SDK-based project in a terminal shell and run the following command:

```bash
srtool build --app --package INSERT_RUNTIME_PACKAGE_NAME --runtime-dir INSERT_RUNTIME_PATH 
```

- The name specified for the `--package` should be the name defined in the `Cargo.toml` file for the runtime
- The path specified for the `--runtime-dir` should be the path to the `Cargo.toml` file for the runtime. For example:

    ```plain
    node/
    pallets/
    runtime/
    ├──lib.rs
    └──Cargo.toml # INSERT_RUNTIME_PATH should be the path to this file
    ...
    ```

- If the `Cargo.toml` file for the runtime is located in a `runtime` subdirectory, for example, `runtime/kusama`, the `--runtime-dir` parameter can be omitted

## Use srtool in GitHub Actions

To add a GitHub workflow for building the runtime:

1. Create a `.github/workflows` directory in the chain's directory
2. In the `.github/workflows` directory, click **Add file**, then select **Create new file**
3. Copy the sample GitHub action from `basic.yml` example in the [`srtools-actions`](https://github.com/chevdor/srtool-actions){target=\_blank} repository and paste it into the file you created in the previous step

    ??? interface "`basic.yml`"

        ```yml
        --8<-- "https://raw.githubusercontent.com/chevdor/srtool-actions/refs/heads/master/examples/01_basic.yml"
        ```

4. Modify the settings in the sample action

    For example, modify the following settings:

    - The name of the chain
    - The name of the runtime package
    - The location of the runtime

5. Type a name for the action file and commit

## Use the srtool Image via Docker Hub

If utilizing [`srtool-cli`](https://github.com/chevdor/srtool-cli){target=\_blank} or [`srtool-app`](https://gitlab.com/chevdor/srtool-app){target=\_blank} isn't an option, the `paritytech/srtool` container image can be used directly via Docker Hub.

To pull the image from Docker Hub:

1. Sign in to Docker Hub
2. Type `paritytech/srtool` in the search field and press enter
3. Click **paritytech/srtool**, then click **Tags**
4. Copy the command for the image you want to pull
5. Open a terminal shell on your local computer
6. Paste the command you copied from the Docker Hub. For example, you might run a command similar to the following, which downloads and unpacks the image:

    ```bash
    docker pull paritytech/srtool:{{ dependencies.repositories.srtool.docker_image_version }}
    ```

### Naming Convention for Images

Keep in mind that there is no `latest` tag for the `srtool` image. Ensure that the image selected is compatible with the locally available version of the Rust compiler.

The naming convention for `paritytech/srtool` Docker images specifies the version of the Rust compiler used to compile the code included in the image. Some images specify both a compiler version and the version of the build script used. For example, an image named `paritytech/srtool:1.62.0-0.9.19` was compiled with version `1.62.0` of the `rustc` compiler and version `0.9.19` of the build script. Images that only specify the compiler version always contain the software's latest version.
