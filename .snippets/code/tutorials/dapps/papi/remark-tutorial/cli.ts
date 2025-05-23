const program = new Command();
console.log(chalk.white.dim(figlet.textSync("Web3 Mail Watcher")));
program
    .version('0.0.1')
    .description('Web3 Mail Watcher - A simple CLI tool to watch for remarks on the Polkadot network')
    .option('-a, --account <account>', 'Account to watch')
    .parse(process.argv);

// CLI arguments from commander
const options = program.opts();