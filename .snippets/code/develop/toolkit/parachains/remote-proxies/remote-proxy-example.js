import { ApiPromise, WsProvider } from '@polkadot/api';

// Account configuration - replace with your addresses
const RECIPIENT_ACCOUNT = 'INSERT_RECIPIENT_ACCOUNT';
const PROXIED_ACCOUNT = 'INSERT_PROXIED_ACCOUNT';

async function executeRemoteProxyTransaction() {
  try {
    // Establish connections to both chains
    console.log('Connecting to Kusama relay chain...');
    const kusamaProvider = new WsProvider(
      'wss://kusama.public.curie.radiumblock.co/ws',
    );
    const kusamaApi = await ApiPromise.create({ provider: kusamaProvider });

    console.log('Connecting to Kusama Asset Hub...');
    const assetHubProvider = new WsProvider(
      'wss://kusama-asset-hub-rpc.polkadot.io',
    );
    const assetHubApi = await ApiPromise.create({ provider: assetHubProvider });

    // Step 1: Generate storage key for proxy definition
    const proxyStorageKey = kusamaApi.query.proxy.proxies.key(PROXIED_ACCOUNT);
    console.log(`Proxy storage key: ${proxyStorageKey}`);

    // Step 2: Identify latest recognized block
    const blockToRootMapping = JSON.parse(
      await assetHubApi.query.remoteProxyRelayChain.blockToRoot(),
    );
    const latestRecognizedBlock =
      blockToRootMapping[blockToRootMapping.length - 1][0];
    const blockHash = await kusamaApi.rpc.chain.getBlockHash(
      latestRecognizedBlock,
    );

    console.log(`Generating proof for block ${latestRecognizedBlock}`);

    // Step 3: Create storage proof
    const storageProof = JSON.parse(
      await kusamaApi.rpc.state.getReadProof([proxyStorageKey], blockHash),
    );

    // Step 4: Define target transaction
    const targetTransaction = assetHubApi.tx.balances.transferAll(
      RECIPIENT_ACCOUNT,
      false,
    );

    // Step 5: Construct remote proxy call
    const remoteProxyCall = assetHubApi.tx.remoteProxyRelayChain.remoteProxy(
      PROXIED_ACCOUNT,
      null, // Proxy type filter (null accepts any compatible type)
      targetTransaction.method,
      {
        RelayChain: {
          proof: storageProof.proof,
          block: latestRecognizedBlock,
        },
      },
    );

    console.log('\n✅ Remote proxy transaction constructed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the URL below');
    console.log('2. Open in Polkadot.js Apps');
    console.log('3. Submit the transaction within 1 minute');
    console.log('\n🔗 Polkadot.js Apps URL:');
    console.log(
      `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama-asset-hub-rpc.polkadot.io#/extrinsics/decode/${remoteProxyCall.method.toHex()}`,
    );

    // Cleanup connections
    await kusamaApi.disconnect();
    await assetHubApi.disconnect();
  } catch (error) {
    console.error('❌ Remote proxy execution failed:', error.message);
  }
}

// Execute the remote proxy workflow
executeRemoteProxyTransaction();
