async function withLightClient(): Promise<PolkadotClient> {
    // Start the light client
    const smoldot = start();
    // The Westend Relay Chain
    const relayChain = await smoldot.addChain({ chainSpec: westEndChainSpec });
    return createClient(
        getSmProvider(relayChain)
    );
}

async function main() {
    // CLI code goes here...
}

main();