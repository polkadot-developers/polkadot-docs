---
title: Polkadot API Account Watcher Tutorial
description: Learn how to build a decentralized command-line application using the Polkadot API.
---

!!!info "This tutorial uses the Westend Test Network"
    Ensure you have an account with WND tokens before proceeding with this tutorial.

### Introduction

This tutorial demonstrates how to build a simple command-line interface (CLI) application that monitors a user's account on the relay chain for the `system.remarkWithEvent` extrinsic.

The `system.remarkWithEvent` extrinsic enables the submission of arbitrary data on-chain. In this tutorial, the data consists of a hash derived from the combination of an account address and the word "email" (`address+email`). This hash is monitored on-chain, and the application listens for remarks addressed to the specified account. The `system.remarkWithEvent` extrinsic emits an event that can be observed using the Polkadot API (PAPI).

Upon detecting a remark addressed to the specified account, the application plays the iconic "You've Got Mail!" sound byte.

### Prerequisites

Before starting, ensure the following tools and dependencies are installed:

- `npm` (or an alternative package manager)
- `node`
- `git`
- [Polkadot.js Browser Extension (wallet)](https://polkadot.js.org/extension/)

Additionally, you will need an account with Westend tokens. Refer to the following resources for assistance:

- [Westend Faucet](https://faucet.polkadot.io/westend)

### Cloning the Repository

To follow this tutorial, you can either run the example directly or use a boilerplate/template. This tutorial uses a template that includes all necessary dependencies for working with the Polkadot API and TypeScript. Clone the appropriate branch (`empty-cli`) of the repository as follows:

```shell
git clone https://github.com/CrackTheCode016/polkadot-api-example-cli --branch empty-cli
```

After cloning, install the required dependencies by running:

```shell
cd polkadot-api-example-cli
npm install
```

### Exploring the Template (Light Clients)

Upon opening the repository, you will find the following code (excluding imports):

```typescript
async function withLightClient(): Promise<PolkadotClient> {
    // Start the light client
    const smoldot = start();
    // The Westend Relay Chain
    const relayChain = await smoldot.addChain({ chainSpec: westEndChainSpec })
    return createClient(
        getSmProvider(relayChain)
    );
}

async function main() {
    // CLI Code goes here...
}

main()
```

The `withLightClient` function is of particular importance. It leverages the built-in light client functionality, powered by [`smoldot`](https://github.com/smol-dot/smoldot), to create a light client that synchronizes and interacts with Polkadot directly within the application.

### Creating the CLI

The CLI functionality is implemented within the `main` function. The CLI includes an option (`-a` / `--account`) to specify the account to monitor for remarks:

```ts
const program = new Command();
console.log(chalk.white.dim(figlet.textSync("Web3 Mail Watcher")));
program.version('0.0.1').description('Web3 Mail Watcher - A simple CLI tool to watch for remarks on Polkadot network');
    .option('-a, --account <account>', 'Account to watch')
    .parse(process.argv);

// CLI Arguments from commander
const options = program.opts();
```

### Watching for Remarks

The application monitors the Westend network for remarks sent to the specified account. The following code, placed within the `main` function, implements this functionality:

```typescript
    // We check for the --account flag, if its not provided we exit
    if (options.account) {
        console.log(chalk.black.bgRed("Watching account:"), chalk.bold.whiteBright(options.account));
        // We create a light client to connect to the Polkadot (Westend) network
        const lightClient = await withLightClient();
        // We get the typed API to interact with the network
        const dotApi = lightClient.getTypedApi(wnd);
        // We subscribe to the System.Remarked event and watch for remarks from our account
        dotApi.event.System.Remarked.watch().subscribe((event) => {
            // We look for a specific hash, indicating that its our address + an email
            const { sender, hash } = event.payload;
            // We calculate the hash of our account + email
            const calculatedHash = bytesToHex(blake2b(`${options.account}+email`, { dkLen: 32 }));
            // If the hash matches, we play a sound and log the message - You got mail!
            if (`0x${calculatedHash}` == hash.asHex()) {
                sound.play("youve-got-mail-sound.mp3")
                console.log(chalk.black.bgRed(`You got mail!`));
                console.log(chalk.black.bgCyan("From:"), chalk.bold.whiteBright(sender.toString()));
                console.log(chalk.black.bgBlue("Hash:"), chalk.bold.whiteBright(hash.asHex()));
            }
        });
    } else {
        // If the account is not provided, we exit
        console.error('Account is required');
        return;
    }
```

### Compiling and Running

Compile and execute the application using the following command:

```shell
npm start -- --account <account-address>
```

For example:

```shell
❯ npm start -- --account 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

> youve-got-mail-web3@1.0.0 start
> tsc && node ./dist/index.js --account 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

 __        __   _    _____   __  __       _ _  __        __    _       _
 \ \      / /__| |__|___ /  |  \/  | __ _(_) | \ \      / /_ _| |_ ___| |__   ___ _ __
  \ \ /\ / / _ \ '_ \ |_ \  | |\/| |/ _` | | |  \ \ /\ / / _` | __/ __| '_ \ / _ \ '__|
   \ V  V /  __/ |_) |__) | | |  | | (_| | | |   \ V  V / (_| | || (__| | | |  __/ |
    \_/\_/ \___|_.__/____/  |_|  |_|\__,_|_|_|    \_/\_/ \__,_|\__\___|_| |_|\___|_|

Watching account: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
[smoldot] Smoldot v2.0.34
[smoldot] Chain initialization complete for westend2. Name: "Westend". Genesis hash: 0xe143…423e. Chain specification starting at: 0x10cf…b908 (#23920337)
```

### Testing the CLI

To test the application, navigate to the [PAPI Dev Console > Extrinsics](https://dev.papi.how/extrinsics#networkId=westend&endpoint=light-client). Select the `System` pallet and the `remark_with_event` call.

Ensure the input field follows the convention `address+email`. For example, if monitoring `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`, the input should be:

![Screenshot 2025-03-03 at 4.58.04 PM](https://hackmd.io/_uploads/S1nx8omo1x.png)

Submit the extrinsic and sign it using the Polkadot.js browser wallet. The CLI will display the following output and play the "You've Got Mail!" sound:

```
 __        __   _    _____   __  __       _ _  __        __    _       _
 \ \      / /__| |__|___ /  |  \/  | __ _(_) | \ \      / /_ _| |_ ___| |__   ___ _ __
  \ \ /\ / / _ \ '_ \ |_ \  | |\/| |/ _` | | |  \ \ /\ / / _` | __/ __| '_ \ / _ \ '__|
   \ V  V /  __/ |_) |__) | | |  | | (_| | | |   \ V  V / (_| | || (__| | | |  __/ |
    \_/\_/ \___|_.__/____/  |_|  |_|\__,_|_|_|    \_/\_/ \__,_|\__\___|_| |_|\___|_|

Watching account: 5Cm8yiG45rqrpyV2zPLrbtr8efksrRuCXcqcB4xj8AejfcTB
You've got mail!
From: 5Cm8yiG45rqrpyV2zPLrbtr8efksrRuCXcqcB4xj8AejfcTB
Hash: 0xb6999c9082f5b1dede08b387404c9eb4eb2deee4781415dfa7edf08b87472050
```

### Conclusion

This application can be extended in various ways, such as implementing a chatroom using remarks or leveraging rollups on Polkadot to enhance functionality.