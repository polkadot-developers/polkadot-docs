---
title: Polkadot API Account Watcher Tutorial
description: This tutorial will focus on learning how to build a decentralized command line application using the Polkadot API.
---

### Project Introduction

Our project will be quite simple - it will be a CLI application that runs in the terminal, which watches the relay chain for a certain `extrinsic` (a transaction). This extrinsic will be the `system.remarkWithEvent` extrinsic, meaning it is coming from the `system` pallet (module) on the Westend test network.

The `system.remarkWithEvent` extrinsic allows us to send any arbitrary data on-chain, with the end result being a hash that is the address and the word "email" combined (`address+email`). We'll hash this combination and watch for remarks on a chain that are addressed to us. The `system.remarkWithEvent` extrinsic emits an event that we can use PAPI to watch the chain for.

Once we receive a remark addressed to us, we will play the infamous "You've Got Mail!" sound byte.

### Prerequisites

You should have the following installed as a prerequisite:

- `npm` (or other package manager)
- `node`
- `git`
- [Polkadot.js Browser Extension (wallet)](https://polkadot.js.org/extension/)

You will also need an account with Westend tokens. Below you can find guides for both Polkadot.js and the faucet:

- [Creating Accounts on Polkadot.js](https://www.youtube.com/watch?v=DNU0p5G0Gqc)
- [Westend Faucet](https://faucet.polkadot.io/westend)

### Cloning the repository

For this tutorial, you can choose to run the example directly by cloning the [main branch of the repository](https://github.com/CrackTheCode016/polkadot-api-example-cli/tree/main), or to use a boilerplate/template and follow the tutorial. 

We need to clone the template, which has everything we need to get started with the Polkadot API and Typescript. Be sure you clone the correct branch (`empty-cli`) which already provides all dependencies:

```shell
git clone https://github.com/CrackTheCode016/polkadot-api-example-cli --branch empty-cli
```

Once cloned, run the following to ensure `npm` dependencies are installed: 

```shell
cd polkadot-api-example-cli
npm install
```

### Exploring the Template (Light Clients!)

When we open the repository, we should see the following code (excluding imports): 

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

The notable function to pay attention to is the `withLightClient` function. This function uses the built in light client functionality (powered by [`smoldot`](https://github.com/smol-dot/smoldot)) to actually create a light client that syncs and interacts with Polkadot right there in our application. 

### Creating the CLI

Next, let's create our CLI, which is to be done within the confines of the `main` function. We will include an option (`-a` / `--account`), which will be the account we will watch for our "mail":

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

Next, we need to start watching the Westend network for remarks sent to our account. As was done before, all code should be within the `main` function: 

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

This code is doing quite a bit, so let's break it down:

- First, we check for the existance of the `--account` argument, and log that we are watching that account, else we exit. We are using the `chalk` package to add color to our `console.log` statements.
- Next, we create our light client.
- We use a light client and the Westend chain specification (`wnd`) to access a typed API. 
- Once we have our API, we then begin to reactively watch the account for the event that corresponds to the remark. We analyze the payload, looking for a hash which is calculated as follows: 
    - hash of: `account_address+email`
- When an event containing this hash is identified, it then plays the "You've Got Mail!" soundbite.

### Compiling and running

Once we have all of our code in place, we should compile and run the repository:

```shell
npm start -- --account <account-address>
```

Upon running, we should have the following output: 

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

## Testing the CLI

Now that our application is actively watching for remark events on-chain, we can move to testing to see if it works! 

> As mentioned previously, you will need a Westend account with some tokens to pay for fees.

Navigate to the [PAPI Dev Console > Extrinsics](https://dev.papi.how/extrinsics#networkId=westend&endpoint=light-client). You then want to select the `System` pallet, and the `remark_with_event` call:

![Screenshot 2025-03-03 at 4.54.29 PM](https://hackmd.io/_uploads/S1sESjXjyl.png)

Next, we want to be sure we get the correct input for the text field. We want to be sure we are following the convention we set forth in our application: 

- `address+email`

If for example, we are watching `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`, then the field should look like the following: 

![Screenshot 2025-03-03 at 4.58.04 PM](https://hackmd.io/_uploads/S1nx8omo1x.png)

Once this input is in place, you may click the `Submit extrinsic` button, where you can sign using the Polkadot.js browser wallet: 

![Screenshot 2025-03-03 at 5.00.20 PM](https://hackmd.io/_uploads/BkktUjQi1l.png)

Heading back to our CLI, we should soon see the following, along with the fact that "YOU'VE GOT MAIL!" (as in the sound should play): 

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

## Conclusion

This application can be expanded in a number of ways, whether that is by adding a chatroom through remarks, or by using some of the rollups on Polkadot to expand the functionality.