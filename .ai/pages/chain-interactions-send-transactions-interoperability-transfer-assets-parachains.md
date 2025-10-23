---
title: Transfer Tokens Between Parachains
description: A step-by-step guide to using the ParaSpell XCM SDK to build, verify, and execute a transfer from one Parachain to another.
url: https://docs.polkadot.com/chain-interactions/send-transactions/interoperability/transfer-assets-parachains/
---

# Transfer Tokens Between Parachains

## Introduction

This guide walks you through transferring tokens between two parachains using the [ParaSpell XCM SDK](https://paraspell.github.io/docs/){target=\_blank}. This example utilizes [Asset Hub](/polkadot-protocol/architecture/system-chains/asset-hub/){target=\_blank} and the [People Chain](/polkadot-protocol/architecture/system-chains/people/){target=\_blank}. However, the same approach can be applied to transfers between other parachains.

For development purposes, this guide will use the [Polkadot TestNet](/develop/networks/#paseo){target=\_blank}, so the transferred token will be PAS.

In this guide, you will:

- Build an XCM transfer transaction using ParaSpell XCM SDK.
- Perform a dry run to validate the transfer.
- Verify the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement on the destination chain.
- Retrieve information regarding the transfer, along with fee estimates.
- Submit the transaction.

### Prerequisites

Before you begin, ensure you have the following:

- Knowledge of the [fundamentals of Polkadot](/polkadot-protocol/parachain-basics/){target=\_blank}.
- Basic understanding of [XCM](/develop/interoperability/intro-to-xcm/){target=\_blank}.
- Basic familiarity with JavaScript or TypeScript.
- Installed [bun](https://bun.com/docs/installation){target=\_blank}, a JavaScript and TypeScript package manager.

## Initialize Your Project

Create the project folder:

```bash
mkdir paraspell-transfer
cd paraspell-transfer
```

Initialize the JavaScript project:

```bash
bun init -y
```

Install the required dependencies:

```bash
bun add @paraspell/sdk@11.3.2 polkadot-api@1.17.1 @polkadot-labs/hdkd-helpers@0.0.25 @polkadot-labs/hdkd@0.0.24
```

Now add the following setup code to `index.ts`:

```ts title="index.ts"
import { Builder, hasDryRunSupport } from '@paraspell/sdk';
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { inspect } from 'util';

// PAS token has 10 decimals
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

Replace the `INSERT_YOUR_SEED_PHRASE` with the seed phrase from your Polkadot development account.

Be sure to fund this account with some PAS tokens on the Paseo Asset Hub using the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1000){target=_blank}.

!!!warning "Security Warning"
    Never commit your mnemonic phrase to production code. Use environment variables or secure key management systems.

## Build a Token Transfer Transaction

The next step is to build the transaction that you intend to execute.

In this example, you will transfer 10 PAS tokens from Paseo's Asset Hub to Paseo's People Chain system parachain.

Add the ParaSpell transaction code to your `index.ts` file:

```ts title="index.ts"
async function transfer() {
  const signer = getSigner();

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS, // 10 PAS
    })
    .address(RECIPIENT_ADDRESS)
    .build();

  console.log('Built transaction:', inspect(tx, { colors: true, depth: null }));

  const result = await tx.signAndSubmit(signer);
  console.log(inspect(result, { colors: true, depth: null }));
  process.exit(0);
}
```

Do not execute it just yet. You will perform a dry run of this transaction first to ensure it works as expected.

## Perform a Dry Run

Dry runs simulate the transaction without broadcasting it, allowing you to confirm success in advance.

Add the following dry run code to your `index.ts` script:

```ts title="index.ts"
async function dryRunTransfer() {
  if (!hasDryRunSupport('AssetHubPaseo')) {
    console.log('Dry run is not supported on AssetHubPaseo.');
    return;
  }

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .dryRun();

  console.log(inspect(tx, { colors: true, depth: null }));
  process.exit(0);
}

dryRunTransfer();
```
Run the script using the following command:

```bash
bun run index.ts
```

The result of the dry run will look similar to the following example output:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>{
  failureReason: undefined,
  failureChain: undefined,
  origin: {
    success: true,
    fee: 17965000n,
    currency: 'PAS',
    asset: {
      symbol: 'PAS',
      isNative: true,
      decimals: 10,
      existentialDeposit: '100000000',
      location: { parents: 1, interior: { Here: null } },
      isFeeAsset: true,
      amount: 100000000000n
    },
    weight: undefined,
    forwardedXcms: [
      {
        type: 'V3',
        value: {
          parents: 1,
          interior: { type: 'X1', value: { type: 'Parachain', value: 1004 } }
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
    destParaId: 1004
  },
  assetHub: undefined,
  bridgeHub: undefined,
  destination: {
    success: true,
    fee: 817598n,
    currency: 'PAS',
    asset: {
      symbol: 'PAS',
      isNative: true,
      decimals: 10,
      existentialDeposit: '1000000000',
      location: { parents: 1, interior: { Here: null } },
      isFeeAsset: true
    },
    weight: { refTime: 176858000n, proofSize: 0n },
    forwardedXcms: [],
    destParaId: undefined
  },
  hops: []
}</span>
</div>
## Verify the Existential Deposit

Check if the recipient account meets the [Existential Deposit (ED)](/polkadot-protocol/glossary/#existential-deposit){target=\_blank} requirement before sending by using [`verifyEdOnDestination`](https://paraspell.github.io/docs/sdk/xcmUtils.html#verify-ed-on-destination){target=\_blank}:

```ts title="index.ts"
async function verifyED() {
  const isValid = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .verifyEdOnDestination();

  console.log(`ED verification ${isValid ? 'successful' : 'failed'}.`);
  process.exit(0);
}

verifyED();
```
Comment out the `dryRunTransfer()` function so that it is not executed again. Then, execute the `verifyED()` by running the following command:

```bash
bun run index.ts
```

After that, you will get output confirming the ED which will look similar to the following:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>ED verification successful.</span>
</div>
## Get Transfer Info and Fee Estimates

Before sending an XCM transaction, it is helpful to estimate the fees associated with executing and delivering the cross-chain message.

ParaSpell has a helpful function for this: [`getTransferInfo()`](https://paraspell.github.io/docs/sdk/xcmUtils.html#xcm-transfer-info){target=\_blank}. This function returns an estimate of the associated XCM fees, along with the account's balance before and after the fees are paid.

```ts title="index.ts"
async function XcmTransferInfo() {
  const info = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .getTransferInfo();

  console.log('Transfer Info:', info);
  process.exit(0);
}

XcmTransferInfo();
```

Comment out the `verifyED()` function so it doesn't execute again. Then, execute the `XcmTransferInfo()` function by running the following command:

```bash
bun run index.ts
```

You will see all the information for your transfer similar to the following example:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>bun run index.ts</span>
  <span data-ty>Transfer Info: {
  chain: {
    origin: "AssetHubPaseo",
    destination: "PeoplePaseo",
    ecosystem: "PAS",
  },
  origin: {
    selectedCurrency: {
      sufficient: true,
      balance: 9799197260420n,
      balanceAfter: 9699197260420n,
      currencySymbol: "PAS",
      asset: [Object ...],
      existentialDeposit: 100000000n,
    },
    xcmFee: {
      sufficient: true,
      fee: 17965000n,
      balance: 9799197260420n,
      balanceAfter: 9799179295420n,
      currencySymbol: "PAS",
      asset: [Object ...],
    },
  },
  assetHub: undefined,
  bridgeHub: undefined,
  hops: [],
  destination: {
    receivedCurrency: {
      sufficient: true,
      receivedAmount: 99999182402n,
      balance: 199998364804n,
      balanceAfter: 299997547206n,
      currencySymbol: "PAS",
      asset: [Object ...],
      existentialDeposit: 1000000000n,
    },
    xcmFee: {
      fee: 817598n,
      balance: 199998364804n,
      balanceAfter: 299997547206n,
      currencySymbol: "PAS",
      asset: [Object ...],
    },
  },
}</span>
</div>
Now that you have:

- Completed a successful dry run of the transaction.
- Verified the existential deposit on the recipient account.
- Obtained an estimate of the associated XCM fees.

You can execute the transfer function by adding the following function call:

```typescript title="index.ts"
transfer();
```

Comment out the `XcmTransferInfo()` function so it doesn't execute again. Then, execute the transfer by running the following command: 

```bash
bun run index.ts
```

Your `transfer` function will submit the transaction, and you will get the following output:

<div id="termynal" data-termynal>
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
            interior: { type: 'X1', value: { type: 'Parachain', value: 1004 } }
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
Once the transaction is successfully included in a block, you will see the recipient's account balance updated, and you will receive output similar to the following.

???- code "Successful Transaction Submission"
    This output will be returned once the transaction has been successfully included in a block.

    <div id="termynal" data-termynal>
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
After executing the transfer, check the account balance on [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo){target=\_blank} for [Paseo's Asset Hub](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.turboflakes.io%2Fasset-hub-paseo#/accounts){target=\_blank} and [Paseo's People Chain](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsys.ibp.network%2Fpeople-paseo#/accounts){target=\_blank}.

You should see:

- The recipient account now has 10 more PAS tokens.
- The sender account has the transfer amount (10 PAS) + the fees amount debited from their account balance.

You have now successfully created and sent a cross-chain transfer using the ParaSpell XCM SDK!

???- code "Full Code"

    ```typescript title="index.ts"
    import { Builder, hasDryRunSupport } from '@paraspell/sdk';
    import {
      entropyToMiniSecret,
      mnemonicToEntropy,
      ss58Address,
    } from '@polkadot-labs/hdkd-helpers';
    import { getPolkadotSigner } from 'polkadot-api/signer';
    import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
    import { inspect } from 'util';

    // PAS token has 10 decimals
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

    async function transfer() {
      const signer = getSigner();

      const tx = await Builder()
        .from('AssetHubPaseo')
        .to('PeoplePaseo')
        .currency({
          symbol: 'PAS',
          amount: 10n * PAS_UNITS, // 10 PAS
        })
        .address(RECIPIENT_ADDRESS)
        .build();

      console.log('Built transaction:', inspect(tx, { colors: true, depth: null }));

      const result = await tx.signAndSubmit(signer);
      console.log(inspect(result, { colors: true, depth: null }));
      process.exit(0);
    }

    async function dryRunTransfer() {
      if (!hasDryRunSupport('AssetHubPaseo')) {
        console.log('Dry run is not supported on AssetHubPaseo.');
        return;
      }

      const tx = await Builder()
        .from('AssetHubPaseo')
        .to('PeoplePaseo')
        .currency({
          symbol: 'PAS',
          amount: 10n * PAS_UNITS,
        })
        .address(RECIPIENT_ADDRESS)
        .senderAddress(SENDER_ADDRESS)
        .dryRun();

      console.log(inspect(tx, { colors: true, depth: null }));
      process.exit(0);
    }

    dryRunTransfer();

    async function verifyED() {
      const isValid = await Builder()
        .from('AssetHubPaseo')
        .to('PeoplePaseo')
        .currency({
          symbol: 'PAS',
          amount: 10n * PAS_UNITS,
        })
        .address(RECIPIENT_ADDRESS)
        .senderAddress(SENDER_ADDRESS)
        .verifyEdOnDestination();

      console.log(`ED verification ${isValid ? 'successful' : 'failed'}.`);
      process.exit(0);
    }

    verifyED();

    async function XcmTransferInfo() {
      const info = await Builder()
        .from('AssetHubPaseo')
        .to('PeoplePaseo')
        .currency({
          symbol: 'PAS',
          amount: 10n * PAS_UNITS,
        })
        .address(RECIPIENT_ADDRESS)
        .senderAddress(SENDER_ADDRESS)
        .getTransferInfo();

      console.log('Transfer Info:', info);
      process.exit(0);
    }

    XcmTransferInfo();

    transfer();

    ```

## Next Steps

- Read the Docs: Dive deeper into the features of the [ParaSpell XCM SDK](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank} documentation.

- Learn about XCM: Understand the underlying protocol by visiting the [Introduction to XCM page](/develop/interoperability/intro-to-xcm/) in the Polkadot Docs.
