---
title: Build a deterministic runtime
description: Explains how to use the Substrate runtime toolbox and Docker to build deterministic WebAssembly binaries for Polkadot SDK-based chains.
---

By default, the Rust compiler produces optimized WebAssembly binaries. These binaries are suitable for working in an isolated environment, such as local development. However, the WebAssembly binaries that the compiler builds by default aren't guaranteed to be deterministically reproducible. Each time the compiler generates the WebAssembly runtime, it might produce slightly different WebAssembly byte code. 

This is problematic in a blockchain network where all nodes must use exactly the same raw chain specification file.

Working with builds that aren't guaranteed to be deterministically reproducible can cause other problems, too.  For example, for automating the build processes for a blockchain, it is ideal that the same code always produces the same result (in terms of bytecode). Without a deterministic build, compiling the WebAssembly runtime with every push would produce inconsistent and unpredictable results, making it difficult to integrate with any automation and likely to continuously break a CI/CD pipeline. Deterministic builds—code that always compiles to exactly the same bytecode—also ensure that the WebAssembly runtime can be inspected, audited, and independently verified.

## Tooling for WebAssembly Runtime

To compile the WebAssembly runtime in a deterministic way, the same tooling that produces the runtime for Polkadot, Kusama, and other Polkadot SDK-based chains can be used. This tooling, referred to collectively as the Substrate runtime toolbox or `srtool`, ensures that the same source code consistently compiles to an identical WebAssembly blob.

The core component of the Substrate Runtime Toolbox (`srtool`) is a Docker container. This container is executed as part of a Docker image. The name of the `srtool` Docker image specifies the version of the Rust compiler used to compile the code included in the image. For example, the image `paritytech/srtool:1.62.0` indicates that the code in the image was compiled with version `1.62.0` of the `rustc` compiler.

## Working with the Docker Container

Because `srtool` is a Docker container, Docker must be available to use it.

The `srtool-cli` package is a command-line utility written in Rust that installs an executable program called `srtool`. This program simplifies the interactions with the `srtool` Docker container.

Over time, the tooling around the `srtool` Docker image has expanded to include the following tools and helper programs:

- [`srtool-cli`](https://github.com/chevdor/srtool-cli){target=\_blank} provides a command-line interface to pull the srtool Docker image, get information about the image and tooling used to interact with it, and build the runtime using the `srtool` Docker container
- [`subwasm`](https://github.com/chevdor/subwasm){target=\_blank} provides command-line options for working with the metadata and WebAssembly runtime built using srtool. The `subwasm` program is also used internally to perform tasks in the `srtool` image
- [`srtool-actions`](https://github.com/chevdor/srtool-actions){target=\_blank} provides GitHub actions to integrate builds produced using the `srtool` image with your GitHub CI/CD pipelines
- [`srtool-app`](https://gitlab.com/chevdor/srtool-app){target=\_blank} provides a simple graphical user interface for building the runtime using the `srtool` Docker image

## Prepare the Environment

To work with the Docker image that executes the code in the `srtool` Docker container, you must have a Docker account and Docker command-line or desktop tools available.

It is recommended to install the `srtool-cli` program to work with the Docker image using a simple command-line interface.

To prepare the environment:

1. Open a terminal shell

2. Verify that that Docker is installed by running the following command:

   ```bash
   docker --version
   ```

   If Docker is installed, the command displays version information:

   ```text
   Docker version 20.10.17, build 100c701
   ```

3. Install the `srtool` command-line interface by running the following command:

   ```bash
   cargo install --git https://github.com/chevdor/srtool-cli
   ```

4. View usage information for the `srtool` command-line interface by running the following command:

   ```bash
   srtool help
   ```

5. Download the latest `srtool` Docker image by running the following command:

   ```bash
   srtool pull
   ```

## Start a Deterministic Build

After the environment has been prepared, the WebAssembly runtime can be compiled using the `srtool` Docker image.

To build the runtime:

```bash
srtool build --app --package node-template-runtime --runtime-dir runtime
```

- The name specified for the `--package` should be the name defined in the `Cargo.toml` file for the runtime
- The path specified for the `--runtime-dir` should be the path to the `Cargo.toml` file for the runtime
- If the `Cargo.toml` file for the runtime is located in a `runtime` subdirectory, for example, `runtime/kusama`,  the `--runtime-dir` parameter can be omitted

## Add Workflow Actions

To add a GitHub workflow for building the runtime:

1. Create a `.github/workflows` directory in the chain's directory
2. In the `.github/workflows` directory, click **Add file**, then select **Create new file**
3. Copy the sample GitHub action from `basic.yml` example in the [srtools-actions](https://github.com/chevdor/srtool-actions){target=\_blank} repository and paste it into the file you created in the previous step

4. Modify the settings in the sample action

   For example, modify the following settings:

   - The name of the chain
   - The name of the runtime package
   - The location of the runtime

5. Type a name for the action file, and commit

If utilizing [`srtool-cli`](/reference/command-line-tools/srtool/#srtool-cli){target=\_blank} or [`srtool-app`](https://gitlab.com/chevdor/srtool-app){target=\_blank} is not an option, the `paritytech/srtool` container image can be used directly via Docker Hub.

To pull the image from Docker Hub:

1. Sign in to Docker Hub
2. Type `paritytech/srtool` in the Search field and press Enter
3. Click **paritytech/srtool**, then click **Tags**
4. Copy the command for the image you want to pull
5. Open a terminal shell on your local computer
6. Paste the command you copied from the Docker Hub

   For example, you might run a command similar to the following:

   ```bash
   docker pull paritytech/srtool:1.62.0
   ```

   The command downloads and unpacks the image.

### Naming Convention for Images

Keep in mind that there is no `latest` tag for the `srtool` image.  Ensure that the image selected is compatible with the version of the Rust compiler that is locally available.

The naming convention for `paritytech/srtool` Docker images specifies the version of the Rust compiler used to compile the code included in the image.
There are also images that specify both a compiler version and the version of the build script used.
For example, an image named `paritytech/srtool:1.62.0-0.9.19` was compiled with version `1.62.0` of the `rustc` compiler but using the version `0.9.19` of the build script.

Images that only specifies the compiler version always contains the latest version of the software.