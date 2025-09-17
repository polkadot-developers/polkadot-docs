---
title: XCM Runtime APIs
description: Learn about XCM Runtime APIs in Polkadot for cross-chain communication.
  Explore the APIs to simulate and test XCM messages before execution on the network.
categories: Reference, Polkadot Protocol
url: https://docs.polkadot.com/develop/interoperability/xcm-runtime-apis/
---

# XCM Runtime APIs

## Introduction

Runtime APIs allow node-side code to extract information from the runtime state. While simple storage access retrieves stored values directly, runtime APIs enable arbitrary computation, making them a powerful tool for interacting with the chain's state.

Unlike direct storage access, runtime APIs can derive values from storage based on arguments or perform computations that don't require storage access. For example, a runtime API might expose a formula for fee calculation, using only the provided arguments as inputs rather than fetching data from storage.

In general, runtime APIs are used for:

- Accessing a storage item.
- Retrieving a bundle of related storage items.
- Deriving a value from storage based on arguments.
- Exposing formulas for complex computational calculations.

This section will teach you about specific runtime APIs that support XCM processing and manipulation.

## Dry Run API

The [Dry-run API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/trait.DryRunApi.html){target=\_blank}, given an extrinsic, or an XCM program, returns its effects:

- Execution result
- Local XCM (in the case of an extrinsic)
- Forwarded XCMs
- List of events

This API can be used independently for dry-running, double-checking, or testing. However, it mainly shines when used with the [Xcm Payment API](#xcm-payment-api), given that it only estimates fees if you know the specific XCM you want to execute or send.

### Dry Run Call

This API allows a dry-run of any extrinsic and obtaining the outcome if it fails or succeeds, as well as the local xcm and remote xcm messages sent to other chains.

```rust
fn dry_run_call(origin: OriginCaller, call: Call, result_xcms_version: XcmVersion) -> Result<CallDryRunEffects<Event>, Error>;
```

??? interface "Input parameters"

    `origin` ++"OriginCaller"++ <span class="required" markdown>++"required"++</span>
    
    The origin used for executing the transaction.

    ---

    `call` ++"Call"++ <span class="required" markdown>++"required"++</span>

    The extrinsic to be executed.

    ---

??? interface "Output parameters"

    ++"Result<CallDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `CallDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `local_xcm` ++"Option<VersionedXcm<()>>"++

        The local XCM that was attempted to be executed, if any.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.

??? interface "Example"

    This example demonstrates how to simulate a cross-chain asset transfer from the Paseo network to the Pop Network using a [reserve transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#reserve-asset-transfer){target=\_blank} mechanism. Instead of executing the actual transfer, the code shows how to test and verify the transaction's behavior through a dry run before performing it on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { paseo } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import {
  PolkadotRuntimeOriginCaller,
  XcmVersionedLocation,
  XcmVersionedAssets,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
} from '@polkadot-api/descriptors';
import { DispatchRawOrigin } from '@polkadot-api/descriptors';
import { Binary } from 'polkadot-api';
import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

// Connect to the Paseo relay chain
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://paseo-rpc.dwellir.com')),
);

const paseoApi = client.getTypedApi(paseo);

const popParaID = 4001;
const userAddress = 'INSERT_USER_ADDRESS';
const userPublicKey = ss58Decode(userAddress)[0];
const idBeneficiary = Binary.fromBytes(userPublicKey);

// Define the origin caller
// This is a regular signed account owned by a user
let origin = PolkadotRuntimeOriginCaller.system(
  DispatchRawOrigin.Signed(userAddress),
);

// Define a transaction to transfer assets from Polkadot to Pop Network using a Reserve Transfer
const tx = paseoApi.tx.XcmPallet.limited_reserve_transfer_assets({
  dest: XcmVersionedLocation.V3({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.Parachain(popParaID), // Destination is the Pop Network parachain
    ),
  }),
  beneficiary: XcmVersionedLocation.V3({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        // Beneficiary address on Pop Network
        network: undefined,
        id: idBeneficiary,
      }),
    ),
  }),
  assets: XcmVersionedAssets.V3([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 0,
        interior: XcmV3Junctions.Here(), // Native asset from the sender. In this case PAS
      }),
      fun: XcmV3MultiassetFungibility.Fungible(120000000000n), // Asset amount to transfer
    },
  ]),
  fee_asset_item: 0, // Asset used to pay transaction fees
  weight_limit: XcmV3WeightLimit.Unlimited(), // No weight limit on transaction
});

// Execute the dry run call to simulate the transaction
const dryRunResult = await paseoApi.apis.DryRunApi.dry_run_call(
  origin,
  tx.decodedCall,
);

// Extract the data from the dry run result
const {
  execution_result: executionResult,
  emitted_events: emmittedEvents,
  local_xcm: localXcm,
  forwarded_xcms: forwardedXcms,
} = dryRunResult.value;

// Extract the XCM generated by this call
const xcmsToPop = forwardedXcms.find(
  ([location, _]) =>
    location.type === 'V4' &&
    location.value.parents === 0 &&
    location.value.interior.type === 'X1' &&
    location.value.interior.value.type === 'Parachain' &&
    location.value.interior.value.value === popParaID, // Pop network's ParaID
);
const destination = xcmsToPop[0];
const remoteXcm = xcmsToPop[1][0];

// Print the results
const resultObject = {
  execution_result: executionResult,
  emitted_events: emmittedEvents,
  local_xcm: localXcm,
  destination: destination,
  remote_xcm: remoteXcm,
};

console.dir(resultObject, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <pre>
    {
      execution_result: {
        success: true,
        value: {
          actual_weight: undefined,
          pays_fee: { type: 'Yes', value: undefined }
        }
      },
      emitted_events: [
        {
          type: 'Balances',
          value: {
            type: 'Transfer',
            value: {
              from: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              to: '13YMK2ePPKQeW7ynqLozB65WYjMnNgffQ9uR4AzyGmqnKeLq',
              amount: 120000000000n
            }
          }
        },
        {
          type: 'Balances',
          value: { type: 'Issued', value: { amount: 0n } }
        },
        {
          type: 'XcmPallet',
          value: {
            type: 'Attempted',
            value: {
              outcome: {
                type: 'Complete',
                value: { used: { ref_time: 251861000n, proof_size: 6196n } }
              }
            }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Burned',
            value: {
              who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              amount: 397000000n
            }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Minted',
            value: {
              who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
              amount: 397000000n
            }
          }
        },
        {
          type: 'XcmPallet',
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
                    parents: 0,
                    interior: { type: 'Here', value: undefined }
                  },
                  fun: { type: 'Fungible', value: 397000000n }
                }
              ]
            }
          }
        },
        {
          type: 'XcmPallet',
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
                parents: 0,
                interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
              },
              message: [
                {
                  type: 'ReserveAssetDeposited',
                  value: [
                    {
                      id: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      },
                      fun: { type: 'Fungible', value: 120000000000n }
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
                      fun: { type: 'Fungible', value: 120000000000n }
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
          }
        }
      ],
      local_xcm: undefined,
      destination: {
        type: 'V4',
        value: {
          parents: 0,
          interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
        }
      },
      remote_xcm: {
        type: 'V3',
        value: [
          {
            type: 'ReserveAssetDeposited',
            value: [
              {
                id: {
                  type: 'Concrete',
                  value: {
                    parents: 1,
                    interior: { type: 'Here', value: undefined }
                  }
                },
                fun: { type: 'Fungible', value: 120000000000n }
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
                fun: { type: 'Fungible', value: 120000000000n }
              },
              weight_limit: { type: 'Unlimited', value: undefined }
            }
          },
          {
            type: 'DepositAsset',
            value: {
              assets: { type: 'Wild', value: { type: 'AllCounted', value: 1 } },
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
    }      
  </pre>
</div>

                ...
    <div id="termynal" data-termynal>
  <pre>
    {
      execution_result: {
        success: true,
        value: {
          actual_weight: undefined,
          pays_fee: { type: 'Yes', value: undefined }
        }
      },
      emitted_events: [
        {
          type: 'Balances',
          value: {
            type: 'Transfer',
            value: {
              from: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              to: '13YMK2ePPKQeW7ynqLozB65WYjMnNgffQ9uR4AzyGmqnKeLq',
              amount: 120000000000n
            }
          }
        },
        {
          type: 'Balances',
          value: { type: 'Issued', value: { amount: 0n } }
        },
        {
          type: 'XcmPallet',
          value: {
            type: 'Attempted',
            value: {
              outcome: {
                type: 'Complete',
                value: { used: { ref_time: 251861000n, proof_size: 6196n } }
              }
            }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Burned',
            value: {
              who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              amount: 397000000n
            }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Minted',
            value: {
              who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
              amount: 397000000n
            }
          }
        },
        {
          type: 'XcmPallet',
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
                    parents: 0,
                    interior: { type: 'Here', value: undefined }
                  },
                  fun: { type: 'Fungible', value: 397000000n }
                }
              ]
            }
          }
        },
        {
          type: 'XcmPallet',
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
                parents: 0,
                interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
              },
              message: [
                {
                  type: 'ReserveAssetDeposited',
                  value: [
                    {
                      id: {
                        parents: 1,
                        interior: { type: 'Here', value: undefined }
                      },
                      fun: { type: 'Fungible', value: 120000000000n }
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
                      fun: { type: 'Fungible', value: 120000000000n }
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
          }
        }
      ],
      local_xcm: undefined,
      destination: {
        type: 'V4',
        value: {
          parents: 0,
          interior: { type: 'X1', value: { type: 'Parachain', value: 4001 } }
        }
      },
      remote_xcm: {
        type: 'V3',
        value: [
          {
            type: 'ReserveAssetDeposited',
            value: [
              {
                id: {
                  type: 'Concrete',
                  value: {
                    parents: 1,
                    interior: { type: 'Here', value: undefined }
                  }
                },
                fun: { type: 'Fungible', value: 120000000000n }
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
                fun: { type: 'Fungible', value: 120000000000n }
              },
              weight_limit: { type: 'Unlimited', value: undefined }
            }
          },
          {
            type: 'DepositAsset',
            value: {
              assets: { type: 'Wild', value: { type: 'AllCounted', value: 1 } },
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
    }      
  </pre>
</div>


    ---

### Dry Run XCM

This API allows the direct dry-run of an xcm message instead of an extrinsic one, checks if it will execute successfully, and determines what other xcm messages will be forwarded to other chains.

```rust
fn dry_run_xcm(origin_location: VersionedLocation, xcm: VersionedXcm<Call>) -> Result<XcmDryRunEffects<Event>, Error>;
```

??? interface "Input parameters"

    `origin_location` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>

    The location of the origin that will execute the xcm message.

    ---

    `xcm` ++"VersionedXcm<Call>"++ <span class="required" markdown>++"required"++</span>

    A versioned XCM message.

    ---

??? interface "Output parameters"

    ++"Result<XcmDryRunEffects<Event>, Error>"++

    Effects of dry-running an extrinsic. If an error occurs, it is returned instead of the effects.

    ??? child "Type `XcmDryRunEffects<Event>`"

        `execution_result` ++"DispatchResultWithPostInfo"++

        The result of executing the extrinsic.

        ---

        `emitted_events` ++"Vec<Event>"++

        The list of events fired by the extrinsic.

        ---

        `forwarded_xcms` ++"Vec<(VersionedLocation, Vec<VersionedXcm<()>>)>"++

        The list of XCMs that were queued for sending.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.

    ---

??? interface "Example"

    This example demonstrates how to simulate a [teleport asset transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#asset-teleportation){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain. The code shows how to test and verify the received XCM message's behavior in the destination chain through a dry run on the live network.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

     ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import {
  XcmVersionedXcm,
  paseoAssetHub,
  XcmVersionedLocation,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
  XcmV3Instruction,
  XcmV3MultiassetMultiAssetFilter,
  XcmV3MultiassetWildMultiAsset,
} from '@polkadot-api/descriptors';
import { Binary } from 'polkadot-api';
import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

// Connect to Paseo Asset Hub
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

const userAddress = 'INSERT_USER_ADDRESS';
const userPublicKey = ss58Decode(userAddress)[0];
const idBeneficiary = Binary.fromBytes(userPublicKey);

// Define the origin
const origin = XcmVersionedLocation.V3({
  parents: 1,
  interior: XcmV3Junctions.Here(),
});

// Define a xcm message comming from the Paseo relay chain to Asset Hub to Teleport some tokens
const xcm = XcmVersionedXcm.V3([
  XcmV3Instruction.ReceiveTeleportedAsset([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
    },
  ]),
  XcmV3Instruction.ClearOrigin(),
  XcmV3Instruction.BuyExecution({
    fees: {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
    },
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }),
  XcmV3Instruction.DepositAsset({
    assets: XcmV3MultiassetMultiAssetFilter.Wild(
      XcmV3MultiassetWildMultiAsset.All(),
    ),
    beneficiary: {
      parents: 0,
      interior: XcmV3Junctions.X1(
        XcmV3Junction.AccountId32({
          network: undefined,
          id: idBeneficiary,
        }),
      ),
    },
  }),
]);

// Execute dry run xcm
const dryRunResult = await paseoAssetHubApi.apis.DryRunApi.dry_run_xcm(
  origin,
  xcm,
);

// Print the results
console.dir(dryRunResult.value, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <pre>
    {
      execution_result: {
        type: 'Complete',
        value: { used: { ref_time: 15574200000n, proof_size: 359300n } }
      },
      emitted_events: [
        {
          type: 'System',
          value: {
            type: 'NewAccount',
            value: { account: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET' }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Endowed',
            value: {
              account: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              free_balance: 10203500000n
            }
          }
        },
        {
          type: 'Balances',
          value: {
            type: 'Minted',
            value: {
              who: '12pGtwHPL4tUAUcyeCoJ783NKRspztpWmXv4uxYRwiEnYNET',
              amount: 10203500000n
            }
          }
        },
        {
          type: 'Balances',
          value: { type: 'Issued', value: { amount: 1796500000n } }
        },
        {
          type: 'Balances',
          value: {
            type: 'Deposit',
            value: {
              who: '13UVJyLgBASGhE2ok3TvxUfaQBGUt88JCcdYjHvUhvQkFTTx',
              amount: 1796500000n
            }
          }
        }
      ],
      forwarded_xcms: [
        [
          {
            type: 'V4',
            value: { parents: 1, interior: { type: 'Here', value: undefined } }
          },
          []
        ]
      ]
    }
  </pre>
</div>


    ---

## XCM Payment API

The [XCM Payment API](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/fees/trait.XcmPaymentApi.html){target=\_blank} provides a standardized way to determine the costs and payment options for executing XCM messages. Specifically, it enables clients to:

- Retrieve the [weight](/polkadot-protocol/glossary/#weight) required to execute an XCM message.
- Obtain a list of acceptable `AssetIds` for paying execution fees.
- Calculate the cost of the weight in a specified `AssetId`.
- Estimate the fees for XCM message delivery.

This API eliminates the need for clients to guess execution fees or identify acceptable assets manually. Instead, clients can query the list of supported asset IDs formatted according to the XCM version they understand. With this information, they can weigh the XCM program they intend to execute and convert the computed weight into its cost using one of the acceptable assets.

To use the API effectively, the client must already know the XCM program to be executed and the chains involved in the program's execution.

### Query Acceptable Payment Assets

Retrieves the list of assets that are acceptable for paying fees when using a specific XCM version

```rust
fn query_acceptable_payment_assets(xcm_version: Version) -> Result<Vec<VersionedAssetId>, Error>;
```

??? interface "Input parameters"

    `xcm_version` ++"Version"++ <span class="required" markdown>++"required"++</span>

    Specifies the XCM version that will be used to send the XCM message.

    ---

??? interface "Output parameters"

    ++"Result<Vec<VersionedAssetId>, Error>"++

    A list of acceptable payment assets. Each asset is provided in a versioned format (`VersionedAssetId`) that matches the specified XCM version. If an error occurs, it is returned instead of the asset list.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to query the acceptable payment assets for executing XCM messages on the Paseo Asset Hub network using XCM version 3.

    ***Usage with PAPI***

    ```js
    import { paseoAssetHub } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

// Connect to the polkadot relay chain
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

// Define the xcm version to use
const xcmVersion = 3;

// Execute the runtime call to query the assets
const result =
  await paseoAssetHubApi.apis.XcmPaymentApi.query_acceptable_payment_assets(
    xcmVersion,
  );

// Print the assets
console.dir(result.value, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <pre>
    [
      {
        type: 'V3',
        value: {
          type: 'Concrete',
          value: { parents: 1, interior: { type: 'Here', value: undefined } }
        }
      }
    ]
  </pre>
</div>


    ---

### Query XCM Weight

Calculates the weight required to execute a given XCM message. It is useful for estimating the execution cost of a cross-chain message in the destination chain before sending it.

```rust
fn query_xcm_weight(message: VersionedXcm<()>) -> Result<Weight, Error>;
```

??? interface "Input parameters"

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    A versioned XCM message whose execution weight is being queried.

    ---

??? interface "Output parameters"

    ++"Result<Weight, Error>"++
    
    The calculated weight required to execute the provided XCM message. If the calculation fails, an error is returned instead.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to calculate the weight needed to execute a [teleport transfer](https://wiki.polkadot.com/learn/learn-xcm-usecases/#asset-teleportation){target=\_blank} from the Paseo network to the Paseo Asset Hub parachain using the XCM Payment API. The result shows the required weight in terms of reference time and proof size needed in the destination chain.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import {
  XcmVersionedXcm,
  paseoAssetHub,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
  XcmV3Instruction,
  XcmV3MultiassetMultiAssetFilter,
  XcmV3MultiassetWildMultiAsset,
} from '@polkadot-api/descriptors';
import { Binary } from 'polkadot-api';
import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

// Connect to Paseo Asset Hub
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

const userAddress = 'INSERT_USER_ADDRESS';
const userPublicKey = ss58Decode(userAddress)[0];
const idBeneficiary = Binary.fromBytes(userPublicKey);

// Define a xcm message comming from the Paseo relay chain to Asset Hub to Teleport some tokens
const xcm = XcmVersionedXcm.V3([
  XcmV3Instruction.ReceiveTeleportedAsset([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
    },
  ]),
  XcmV3Instruction.ClearOrigin(),
  XcmV3Instruction.BuyExecution({
    fees: {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
    },
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }),
  XcmV3Instruction.DepositAsset({
    assets: XcmV3MultiassetMultiAssetFilter.Wild(
      XcmV3MultiassetWildMultiAsset.All(),
    ),
    beneficiary: {
      parents: 0,
      interior: XcmV3Junctions.X1(
        XcmV3Junction.AccountId32({
          network: undefined,
          id: idBeneficiary,
        }),
      ),
    },
  }),
]);

// Execute the query weight runtime call
const result = await paseoAssetHubApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

// Print the results
console.dir(result.value, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <span data-ty>{ ref_time: 15574200000n, proof_size: 359300n }</span>
</div>


    ---

### Query Weight to Asset Fee

Converts a given weight into the corresponding fee for a specified `AssetId`. It allows clients to determine the cost of execution in terms of the desired asset.

```rust
fn query_weight_to_asset_fee(weight: Weight, asset: VersionedAssetId) -> Result<u128, Error>;
```

??? interface "Input parameters"

    `weight` ++"Weight"++ <span class="required" markdown>++"required"++</span>
    
    The execution weight to be converted into a fee.

    ??? child "Type `Weight`"

        `ref_time` ++"u64"++

        The weight of computational time used based on some reference hardware.

        ---

        `proof_size` ++"u64"++

        The weight of storage space used by proof of validity.

        ---

    ---

    `asset` ++"VersionedAssetId"++ <span class="required" markdown>++"required"++</span>
    
    The asset in which the fee will be calculated. This must be a versioned asset ID compatible with the runtime.

    ---

??? interface "Output parameters"

    ++"Result<u128, Error>"++
    
    The fee needed to pay for the execution for the given `AssetId.`

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to calculate the fee for a given execution weight using a specific versioned asset ID (PAS token) on Paseo Asset Hub.

    ***Usage with PAPI***

    ```js
    import { paseoAssetHub } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

// Connect to the polkadot relay chain
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

// Define the weight to convert to fee
const weight = { ref_time: 15574200000n, proof_size: 359300n };

// Define the versioned asset id
const versionedAssetId = {
  type: 'V4',
  value: { parents: 1, interior: { type: 'Here', value: undefined } },
};

// Execute the runtime call to convert the weight to fee
const result =
  await paseoAssetHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
    weight,
    versionedAssetId,
  );

// Print the fee
console.dir(result.value, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <span data-ty>1796500000n</span>
</div>

    ---

### Query Delivery Fees

Retrieves the delivery fees for sending a specific XCM message to a designated destination. The fees are always returned in a specific asset defined by the destination chain.

```rust
fn query_delivery_fees(destination: VersionedLocation, message: VersionedXcm<()>) -> Result<VersionedAssets, Error>;
```

??? interface "Input parameters"

    `destination` ++"VersionedLocation"++ <span class="required" markdown>++"required"++</span>
    
    The target location where the message will be sent. Fees may vary depending on the destination, as different destinations often have unique fee structures and sender mechanisms.

    ---

    `message` ++"VersionedXcm<()>"++ <span class="required" markdown>++"required"++</span>
    
    The XCM message to be sent. The delivery fees are calculated based on the message's content and size, which can influence the cost.

    ---

??? interface "Output parameters"

    ++"Result<VersionedAssets, Error>"++
    
    The calculated delivery fees expressed in a specific asset supported by the destination chain. If an error occurs during the query, it returns an error instead.

    ??? child "Type `Error`"

        Enum:

        - **`Unimplemented`**: An API part is unsupported.
        - **`VersionedConversionFailed`**: Converting a versioned data structure from one version to another failed.
        - **`WeightNotComputable`**: XCM message weight calculation failed.
        - **`UnhandledXcmVersion`**: XCM version not able to be handled.
        - **`AssetNotFound`**: The given asset is not handled as a fee asset.
        - **`Unroutable`**: Destination is known to be unroutable.

    ---

??? interface "Example"

    This example demonstrates how to query the delivery fees for sending an XCM message from Paseo to Paseo Asset Hub.

    Replace `INSERT_USER_ADDRESS` with your SS58 address before running the script.

    ***Usage with PAPI***

    ```js
    import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import {
  XcmVersionedXcm,
  paseo,
  XcmVersionedLocation,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
  XcmV3Instruction,
  XcmV3MultiassetMultiAssetFilter,
  XcmV3MultiassetWildMultiAsset,
} from '@polkadot-api/descriptors';
import { Binary } from 'polkadot-api';
import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://paseo-rpc.dwellir.com')),
);

const paseoApi = client.getTypedApi(paseo);

const paseoAssetHubParaID = 1000;
const userAddress = 'INSERT_USER_ADDRESS';
const userPublicKey = ss58Decode(userAddress)[0];
const idBeneficiary = Binary.fromBytes(userPublicKey);

// Define the destination
const destination = XcmVersionedLocation.V3({
  parents: 0,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(paseoAssetHubParaID)),
});

// Define the xcm message that will be sent to the destination
const xcm = XcmVersionedXcm.V3([
  XcmV3Instruction.ReceiveTeleportedAsset([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
    },
  ]),
  XcmV3Instruction.ClearOrigin(),
  XcmV3Instruction.BuyExecution({
    fees: {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000n)),
    },
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }),
  XcmV3Instruction.DepositAsset({
    assets: XcmV3MultiassetMultiAssetFilter.Wild(
      XcmV3MultiassetWildMultiAsset.All(),
    ),
    beneficiary: {
      parents: 0,
      interior: XcmV3Junctions.X1(
        XcmV3Junction.AccountId32({
          network: undefined,
          id: idBeneficiary,
        }),
      ),
    },
  }),
]);

// Execute the query delivery fees runtime call
const result = await paseoApi.apis.XcmPaymentApi.query_delivery_fees(
  destination,
  xcm,
);

// Print the results
console.dir(result.value, { depth: null });

client.destroy();

    ```

    ***Output***

    <div id="termynal" data-termynal>
  <pre>
    {
      type: 'V3',
      value: [
        {
          id: {
            type: 'Concrete',
            value: { parents: 0, interior: { type: 'Here', value: undefined } }
          },
          fun: { type: 'Fungible', value: 396000000n }
        }
      ]
    }
  </pre>
</div>

    ---
