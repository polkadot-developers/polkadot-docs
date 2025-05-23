if (options.account) {
    console.log(chalk.black.bgRed("Watching account:"), chalk.bold.whiteBright(options.account));
    // Create a light client to connect to the Polkadot (Westend) network
    const lightClient = await withLightClient();
    // Get the typed API to interact with the network
    const dotApi = lightClient.getTypedApi(wnd);
    // Subscribe to the System.Remarked event and watch for remarks from the account
    dotApi.event.System.Remarked.watch().subscribe((event) => {
        const { sender, hash } = event.payload;
        const calculatedHash = bytesToHex(blake2b(`${options.account}+email`, { dkLen: 32 }));
        if (`0x${calculatedHash}` === hash.asHex()) {
            sound.play("youve-got-mail-sound.mp3");
            console.log(chalk.black.bgRed("You got mail!"));
            console.log(chalk.black.bgCyan("From:"), chalk.bold.whiteBright(sender.toString()));
            console.log(chalk.black.bgBlue("Hash:"), chalk.bold.whiteBright(hash.asHex()));
        }
    });
} else {
    console.error('Account is required');
    return;
}