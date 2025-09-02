---
title: Teleport Tokens from Asset Hub to Bridge Hub
description: A step-by-step guide to building, verifying, and executing a teleport
  from Asset Hub to Bridge Hub using the ParaSpell XCM SDK.
url: https://docs.polkadot.com/develop/toolkit/interoperability/paraspell-xcm-sdk/teleport-from-asset-hub-to-bridge-hub/
---

# Teleport Tokens from Asset Hub to Bridge Hub

## Introduction

This guide will walk you through the process of teleporting tokens from the Asset Hub to the Bridge Hub system parachain using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=\_blank}.

For development purposes, this guide will use the [Paseo TestNet](/develop/networks/#paseo){target=\_blank}, so the teleport will be from Paseo's Asset Hub to Paseo's Bridge Hub.

You’ll learn how to:

- Build a teleport transaction.
- Perform a dry run to validate it.
- Verify the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement on the destination chain.
- Retrieve information regarding the transfer, along with fee estimates.
- Submit the transaction.

### Prerequisites

- Basic familiarity with JavaScript/TypeScript
- Knowledge of the [fundamentals of Polkadot](/polkadot-protocol/parachain-basics/){target=\_blank}

## Initialize Your Project

Create the project folder:

```bash
mkdir paraspell-teleport
cd paraspell-teleport
```

Initialize the JavaScript project:

```bash
bun init -y
```

Install the required dependencies:

```bash
bun add @paraspell/sdk polkadot-api @polkadot-labs/hdkd-helpers @polkadot-labs/hdkd
```

Now add the following setup code to `index.ts`:

```ts title="index.ts"
-import { Builder, hasDryRunSupport } from '@paraspell/sdk';
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { inspect } from 'util';

// DOT/PAS has 10 decimals
const PAS_UNITS = 10_000_000_000n;

const SEED_PHRASE =
  'INSERT_YOUR_SEED_PHRASE';

// Create Sr25519 signer from mnemonic
function getSigner() {
  const entropy = mnemonicToEntropy(SEED_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keyPair = derive('');
  return getPolkadotSigner(keyPair.publicKey, 'Sr25519', keyPair.sign);
}

const RECIPIENT_ADDRESS = ss58Address(getSigner().publicKey);
const SENDER_ADDRESS = ss58Address(getSigner().publicKey);
```

Replace the `INSERT_YOUR_SEED_PHRASE ` with the seed phrase from your Polkadot development account.

Be sure to fund this account with some PAS tokens on Passeo's Asset Hub using the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000){target=\_blank}.

!!!note "Security Warning"
    Never commit your mnemonic phrase in production code. Use environment variables or secure key management systems.

## Build a Teleport Transaction

The next step is to build the transaction that you intend to execute.

In this example, you will teleport 10 PAS tokens from Paseo's Asset Hub to Paseo's Bridge Hub system parachain.

Add the ParaSpell transaction code to your `index.ts` file:

```ts title="index.ts"
-async function teleport() {
  const signer = getSigner();

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('BridgeHubPaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS, // 10 PAS
    })
    .address(RECIPIENT_ADDRESS)
    .build();

  console.log('Built transaction:', inspect(tx, { colors: true, depth: null }));

  const result = await tx.signAndSubmit(signer);
  console.log(inspect(result, { colors: true, depth: null }));
}
```

Do not execute it just yet. You will perform a dry run of this transaction first to ensure it works as expected.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance.

Add the following dry run code to your `index.ts` script:

```ts title="index.ts"
-async function dryRunTeleport() {
  if (!hasDryRunSupport('AssetHubPaseo')) {
    console.log('Dry run is not supported on AssetHubPaseo.');
    return;
  }

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('BridgeHubPaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .dryRun();

  console.log(inspect(tx, { colors: true, depth: null }));
}

dryRunTeleport();
```
Go ahead and run the script.

```bash
bun run index.ts
```

The result of the dry run will be similar to this:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>{
  failureReason: undefined,
  failureChain: undefined,
  origin: {
    success: true,
    fee: 17965000n,
    weight: undefined,
    forwardedXcms: [
      {
        type: 'V3',
        value: {
          parents: 1,
          interior: { type: 'X1', value: { type: 'Parachain', value: 1002 } }
        }
      },
      [
        {
          type: 'V3',
          value: [
            {
              type: 'ReceiveTeleportedAsset',
              value: [
                {
                  id: {
                    type: 'Concrete',
                    value: {
                      parents: 1,
                      interior: { type: 'Here', value: undefined }
                    }
                  },
                  fun: { type: 'Fungible', value: 100000000000n }
                }
              ]
            },
            { type: 'ClearOrigin', value: undefined },
            {
              type: 'BuyExecution',
              value: {
                fees: {
                  id: {
                    type: 'Concrete',
                    value: {
                      parents: 1,
                      interior: { type: 'Here', value: undefined }
                    }
                  },
                  fun: { type: 'Fungible', value: 100000000000n }
                },
                weight_limit: { type: 'Unlimited', value: undefined }
              }
            },
            {
              type: 'DepositAsset',
              value: {
                assets: {
                  type: 'Wild',
                  value: { type: 'AllCounted', value: 1 }
                },
                beneficiary: {
                  parents: 0,
                  interior: {
                    type: 'X1',
                    value: {
                      type: 'AccountId32',
                      value: {
                        network: undefined,
                        id: FixedSizeBinary {
                          asText: [Function (anonymous)],
                          asHex: [Function (anonymous)],
                          asOpaqueHex: [Function (anonymous)],
                          asBytes: [Function (anonymous)],
                          asOpaqueBytes: [Function (anonymous)]
                        }
                      }
                    }
                  }
                }
              }
            },
            {
              type: 'SetTopic',
              value: FixedSizeBinary {
                asText: [Function (anonymous)],
                asHex: [Function (anonymous)],
                asOpaqueHex: [Function (anonymous)],
                asBytes: [Function (anonymous)],
                asOpaqueBytes: [Function (anonymous)]
              }
            }
          ]
        }
      ]
    ],
    destParaId: 1002,
    currency: 'PAS'
  },
  assetHub: undefined,
  bridgeHub: undefined,
  destination: {
    success: true,
    fee: 17965000n,
    weight: { refTime: 164770000n, proofSize: 3593n },
    forwardedXcms: [],
    destParaId: undefined,
    currency: 'PAS'
  },
  hops: []
}</span>
</div>

## Verify the Existential Deposit

Check if the recipient account meets the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement before sending by using [`verifyEdOnDestination`](https://paraspell.github.io/docs/sdk/xcmUtils.html#verify-ed-on-destination){target=\_blank}:

```ts title="index.ts"
-async function verifyED() {
  const isValid = await Builder()
    .from('AssetHubPaseo')
    .to('BridgeHubPaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .verifyEdOnDestination();

  console.log(`ED verification ${isValid ? 'successful' : 'failed'}.`);
}

verifyED();
```
Execute the code by running:

```bash
bun run index.ts
```

After that, you will get output confirming the ED:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>...</span>
  <span data-ty>ED verification successful.</span>
</div>

## Get Transfer Info and Fee Estimates

Before sending an XCM transaction, it is helpful to estimate the fees associated with executing and delivering the cross-chain message.

ParaSpell has a helpful function for this: [`getTransferInfo()`](https://paraspell.github.io/docs/sdk/xcmUtils.html#xcm-transfer-info){target=\_blank}. This function returns an estimate of the associated XCM fees, along with the account's balance before and after the fees are paid.

```ts title="index.ts"
-async function XcmTransferInfo() {
  const info = await Builder()
    .from('AssetHubPaseo')
    .to('BridgeHubPaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .getTransferInfo();

  console.log('Transfer Info:', info);
}

XcmTransferInfo();
```

Go ahead and execute the script:

```bash
bun run index.ts
```

You should be able to see all the information for your transfer:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>...</span>
  <span data-ty>Transfer Info: {
  chain: {
    origin: 'AssetHubPaseo',
    destination: 'BridgeHubPaseo',
    ecosystem: 'PAS'
  },
  origin: {
    selectedCurrency: {
      sufficient: true,
      balance: 9899002813408n,
      balanceAfter: 9799002813408n,
      currencySymbol: 'PAS',
      existentialDeposit: 100000000n
    },
    xcmFee: {
      sufficient: true,
      fee: 17965000n,
      balance: 9899002813408n,
      balanceAfter: 9898984848408n,
      currencySymbol: 'PAS'
    }
  },
  assetHub: undefined,
  bridgeHub: undefined,
  hops: [],
  destination: {
    receivedCurrency: {
      sufficient: true,
      receivedAmount: 99982035000n,
      balance: 0n,
      balanceAfter: 99982035000n,
      currencySymbol: 'PAS',
      existentialDeposit: 1000000000n
    },
    xcmFee: {
      fee: 17965000n,
      balance: 0n,
      balanceAfter: 99982035000n,
      currencySymbol: 'PAS'
    }
  }
}</span>
</div>

Now that you have:

- Completed a successful dry run of the transaction
- Verified the existential deposit on the recipient account
- Obtained an estimate of the associated XCM fees

Now you can execute the teleport function by adding the following statement:

Add the following code:

```typescript title="index.ts"
-teleport();
```

And execute your teleport:

```bash
bun run index.ts
```

Your `teleport` function will submit the transaction, and you will get the following output:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>...</span>
  <span data-ty>Built transaction: {
  getPaymentInfo: [AsyncFunction: getPaymentInfo],
  getEstimatedFees: [AsyncFunction: getEstimatedFees],
  decodedCall: {
    type: 'PolkadotXcm',
    value: {
      type: 'limited_teleport_assets',
      value: {
        dest: {
          type: 'V5',
          value: {
            parents: 1,
            interior: { type: 'X1', value: { type: 'Parachain', value: 1002 } }
          }
        },
        beneficiary: {
          type: 'V5',
          value: {
            parents: 0,
            interior: {
              type: 'X1',
              value: {
                type: 'AccountId32',
                value: {
                  network: undefined,
                  id: FixedSizeBinary {
                    asText: [Function (anonymous)],
                    asHex: [Function (anonymous)],
                    asOpaqueHex: [Function (anonymous)],
                    asBytes: [Function (anonymous)],
                    asOpaqueBytes: [Function (anonymous)]
                  }
                }
              }
            }
          }
        },
        assets: {
          type: 'V5',
          value: [
            {
              id: { parents: 1, interior: { type: 'Here', value: null } },
              fun: { type: 'Fungible', value: 100000000000n }
            }
          ]
        },
        fee_asset_item: 0,
        weight_limit: { type: 'Unlimited' }
      }
    }
  },
  getEncodedData: [Function: getEncodedData],
  sign: [Function: sign],
  signSubmitAndWatch: [Function: signSubmitAndWatch],
  signAndSubmit: [Function: signAndSubmit]
}</span>
</div>

Once the transaction is successfully included in a block, you will see the recipient's account balance updated, and you will receive output similar to the one below.

???- code "Successful Transaction Submission"
    This output will be returned once the transaction has been successfully included in a block.

    -<div id="termynal" data-termynal>
  <span data-ty>...</span>
  <span data-ty>{
  txHash: '0x6fbecc0b284adcff46ab39872659c2567395c865adef5f8cbea72f25b6042609',
  block: {
    index: 2,
    number: 2524809,
    hash: '0xa39a96d5921402c6e8f67e48b8395d6b21382c72d4d30f8497a0e9f890bc0d4c'
  },
  ok: true,
  events: [
    {
      type: 'Balances',
      value: {
        type: 'Withdraw',
        value: {
          who: '15DMtB5BDCJqw4uZtByTWXGqViAVx7XjRsxWbTH5tfrHLe8j',
          amount: 15668864n
        }
      },
      topics: []
    },
    {
      type: 'Balances',
      value: {
        type: 'Burned',
        value: {
          who: '15DMtB5BDCJqw4uZtByTWXGqViAVx7XjRsxWbTH5tfrHLe8j',
          amount: 100000000000n
        }
      },
      topics: []
    },
    {
      type: 'PolkadotXcm',
      value: {
        type: 'Attempted',
        value: {
          outcome: {
            type: 'Complete',
            value: { used: { ref_time: 190990000n, proof_size: 3593n } }
          }
        }
      },
      topics: []
    },
    {
      type: 'Balances',
      value: {
        type: 'Burned',
        value: {
          who: '15DMtB5BDCJqw4uZtByTWXGqViAVx7XjRsxWbTH5tfrHLe8j',
          amount: 304850000n
        }
      },
      topics: []
    },
    {
      type: 'Balances',
      value: {
        type: 'Minted',
        value: {
          who: '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk',
          amount: 304850000n
        }
      },
      topics: []
    },
    {
      type: 'PolkadotXcm',
      value: {
        type: 'FeesPaid',
        value: {
          paying: {
            parents: 0,
            interior: {
              type: 'X1',
              value: {
                type: 'AccountId32',
                value: {
                  network: { type: 'Polkadot', value: undefined },
                  id: FixedSizeBinary {
                    asText: [Function (anonymous)],
                    asHex: [Function (anonymous)],
                    asOpaqueHex: [Function (anonymous)],
                    asBytes: [Function (anonymous)],
                    asOpaqueBytes: [Function (anonymous)]
                  }
                }
              }
            }
          },
          fees: [
            {
              id: {
                parents: 1,
                interior: { type: 'Here', value: undefined }
              },
              fun: { type: 'Fungible', value: 304850000n }
            }
          ]
        }
      },
      topics: []
    },
    {
      type: 'XcmpQueue',
      value: {
        type: 'XcmpMessageSent',
        value: {
          message_hash: FixedSizeBinary {
            asText: [Function (anonymous)],
            asHex: [Function (anonymous)],
            asOpaqueHex: [Function (anonymous)],
            asBytes: [Function (anonymous)],
            asOpaqueBytes: [Function (anonymous)]
          }
        }
      },
      topics: []
    },
    {
      type: 'PolkadotXcm',
      value: {
        type: 'Sent',
        value: {
          origin: {
            parents: 0,
            interior: {
              type: 'X1',
              value: {
                type: 'AccountId32',
                value: {
                  network: { type: 'Polkadot', value: undefined },
                  id: FixedSizeBinary {
                    asText: [Function (anonymous)],
                    asHex: [Function (anonymous)],
                    asOpaqueHex: [Function (anonymous)],
                    asBytes: [Function (anonymous)],
                    asOpaqueBytes: [Function (anonymous)]
                  }
                }
              }
            }
          },
          destination: {
            parents: 1,
            interior: { type: 'X1', value: { type: 'Parachain', value: 1002 } }
          },
          message: [
            {
              type: 'ReceiveTeleportedAsset',
              value: [
                {
                  id: {
                    parents: 1,
                    interior: { type: 'Here', value: undefined }
                  },
                  fun: { type: 'Fungible', value: 100000000000n }
                }
              ]
            },
            { type: 'ClearOrigin', value: undefined },
            {
              type: 'BuyExecution',
              value: {
                fees: {
                  id: {
                    parents: 1,
                    interior: { type: 'Here', value: undefined }
                  },
                  fun: { type: 'Fungible', value: 100000000000n }
                },
                weight_limit: { type: 'Unlimited', value: undefined }
              }
            },
            {
              type: 'DepositAsset',
              value: {
                assets: {
                  type: 'Wild',
                  value: { type: 'AllCounted', value: 1 }
                },
                beneficiary: {
                  parents: 0,
                  interior: {
                    type: 'X1',
                    value: {
                      type: 'AccountId32',
                      value: {
                        network: undefined,
                        id: FixedSizeBinary {
                          asText: [Function (anonymous)],
                          asHex: [Function (anonymous)],
                          asOpaqueHex: [Function (anonymous)],
                          asBytes: [Function (anonymous)],
                          asOpaqueBytes: [Function (anonymous)]
                        }
                      }
                    }
                  }
                }
              }
            }
          ],
          message_id: FixedSizeBinary {
            asText: [Function (anonymous)],
            asHex: [Function (anonymous)],
            asOpaqueHex: [Function (anonymous)],
            asBytes: [Function (anonymous)],
            asOpaqueBytes: [Function (anonymous)]
          }
        }
      },
      topics: []
    },
    {
      type: 'Balances',
      value: {
        type: 'Deposit',
        value: {
          who: '13UVJyLgBASGhE2ok3TvxUfaQBGUt88JCcdYjHvUhvQkFTTx',
          amount: 15668864n
        }
      },
      topics: []
    },
    {
      type: 'TransactionPayment',
      value: {
        type: 'TransactionFeePaid',
        value: {
          who: '15DMtB5BDCJqw4uZtByTWXGqViAVx7XjRsxWbTH5tfrHLe8j',
          actual_fee: 15668864n,
          tip: 0n
        }
      },
      topics: []
    },
    {
      type: 'System',
      value: {
        type: 'ExtrinsicSuccess',
        value: {
          dispatch_info: {
            weight: { ref_time: 952851000n, proof_size: 13382n },
            class: { type: 'Normal', value: undefined },
            pays_fee: { type: 'Yes', value: undefined }
          }
        }
      },
      topics: []
    }
  ]
}</span>
</div>

After executing the teleport, check the account balance on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo){target=\_blank} for [Paseo's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo#/accounts){target=\_blank} and [Paseo's Bridge Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fbridge-hub-paseo.dotters.network#/accounts){target=\_blank}.

You should see:

- The recipient account now has 10 more PAS tokens.
- The sender account has the transfer amount (10 PAS) + the fees amount debited from their account balance.

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

## Next Steps

- Explore other transfers: 
    - Try a parachain-to-parachain transfer or a transfer from a parachain back to the Relay chain.

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
