import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

async function main() {
  await cryptoWaitReady();

  const mnemonic = mnemonicGenerate(12);
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
  const pair = keyring.addFromMnemonic(mnemonic);

  console.log(`Address: ${pair.address}`);
  console.log(`Mnemonic: ${mnemonic}`);
}

main().catch(console.error);
