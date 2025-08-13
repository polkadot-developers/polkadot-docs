import { Binary, BlockInfo, createClient, Enum, PolkadotClient, TypedApi } from "polkadot-api";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getPolkadotSigner } from "polkadot-api/signer";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import {
    assetHub,
    hydration,
    XcmV2MultiassetWildFungibility,
    XcmV3MultiassetFungibility,
    XcmV3WeightLimit,
    XcmV5AssetFilter,
    XcmV5Instruction,
    XcmV5Junction,
    XcmV5Junctions,
    XcmV5WildAsset,
    XcmVersionedXcm,
} from "@polkadot-api/descriptors";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
    DEV_PHRASE,
    entropyToMiniSecret,
    mnemonicToEntropy,
    ss58Address,
} from "@polkadot-labs/hdkd-helpers";

const XCM_VERSION = 5;
const MAX_RETRIES = 4;

const toHuman = (_key: any, value: any) => {
    if (typeof value === "bigint") {
        return Number(value);
    }

    if (value && typeof value === "object" && typeof value.asHex === "function") {
        return value.asHex();
    }

    return value;
};

async function assertProcessedMessageId(
    client: PolkadotClient,
    api: TypedApi<any>,
    name: String,
    blockBefore: BlockInfo,
    expectedMessageId: String,
) {
    let processedMessageId = undefined;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const blockAfter = await client.getFinalizedBlock();
        if (blockAfter.number == blockBefore.number) {
            const waiting = 1_000 * (2 ** i);
            console.log(`⏳ Waiting ${waiting / 1_000}s for ${name} block to be finalised (${i + 1}/${MAX_RETRIES})...`);
            await new Promise((resolve) => setTimeout(resolve, waiting));
            continue;
        }

        console.log(`📦 Finalised on ${name} in block #${blockAfter.number}: ${blockAfter.hash}`);
        const processedEvents = await api.event.MessageQueue.Processed.pull();
        const processingFailedEvents = await api.event.MessageQueue.ProcessingFailed.pull();
        if (processedEvents.length > 0) {
            processedMessageId = processedEvents[0].payload.id.asHex();
            console.log(`📣 Last message processed on ${name}: ${processedMessageId}`);
            break;
        } else if (processingFailedEvents.length > 0) {
            processedMessageId = processingFailedEvents[0].payload.id.asHex();
            console.log(`📣 Last message ProcessingFailed on ${name}: ${processedMessageId}`);
            break;
        } else {
            console.log(`📣 No Processed events on ${name} found.`);
            blockBefore = blockAfter; // Update the block before to the latest one
        }
    }

    if (processedMessageId === expectedMessageId) {
        console.log(`✅ Processed Message ID on ${name} matched.`);
    } else {
        console.error(`❌ Processed Message ID [${processedMessageId}] on ${name} doesn't match expected Message ID [${expectedMessageId}].`);
    }
}

async function main() {
    const para1Name = "Polkadot Asset Hub";
    const para1Client = createClient(
        withPolkadotSdkCompat(getWsProvider("ws://localhost:8000")),
    );
    const para1Api = para1Client.getTypedApi(assetHub);

    const para2Name = "Hydration";
    const para2Client = createClient(
        withPolkadotSdkCompat(getWsProvider("ws://localhost:8001")),
    );
    const para2Api = para2Client.getTypedApi(hydration);

    const entropy = mnemonicToEntropy(DEV_PHRASE);
    const miniSecret = entropyToMiniSecret(entropy);
    const derive = sr25519CreateDerive(miniSecret);
    const alice = derive("//Alice");
    const alicePublicKey = alice.publicKey;
    const aliceSigner = getPolkadotSigner(alicePublicKey, "Sr25519", alice.sign);
    const aliceAddress = ss58Address(alicePublicKey);

    const origin = Enum("system", Enum("Signed", aliceAddress));
    const beneficiary = {
        parents: 0,
        interior: XcmV5Junctions.X1(XcmV5Junction.AccountId32({
            id: Binary.fromHex("0x9818ff3c27d256631065ecabf0c50e02551e5c5342b8669486c1e566fcbf847f")
        })),
    }
    const assetId = {
        parents: 0,
        interior: XcmV5Junctions.X2([
            XcmV5Junction.PalletInstance(50),
            XcmV5Junction.GeneralIndex(1984n),
        ]),
    };
    const giveId = {
        parents: 1,
        interior: XcmV5Junctions.X3([
            XcmV5Junction.Parachain(1000),
            XcmV5Junction.PalletInstance(50),
            XcmV5Junction.GeneralIndex(1984n),
        ]),
    };
    const giveFun = XcmV3MultiassetFungibility.Fungible(1_500_000n);
    const dest = {
        parents: 1,
        interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(2034)),
    };
    const wantId = {
        parents: 1,
        interior: XcmV5Junctions.Here(),
    };
    const wantFun = XcmV3MultiassetFungibility.Fungible(3_000_000_000n);
    const expectedMessageId = "0xd60225f721599cb7c6e23cdf4fab26f205e30cd7eb6b5ccf6637cdc80b2339b2";

    const message = XcmVersionedXcm.V5([
        XcmV5Instruction.WithdrawAsset([{
            id: assetId,
            fun: giveFun,
        }]),

        XcmV5Instruction.SetFeesMode({ jit_withdraw: true }),

        XcmV5Instruction.DepositReserveAsset({
            assets: XcmV5AssetFilter.Wild(
                XcmV5WildAsset.AllOf({
                    id: assetId,
                    fun: XcmV2MultiassetWildFungibility.Fungible(),
                })),
            dest,
            xcm: [
                XcmV5Instruction.BuyExecution({
                    fees: {
                        id: giveId,
                        fun: giveFun,
                    },
                    weight_limit: XcmV3WeightLimit.Unlimited(),
                }),

                XcmV5Instruction.ExchangeAsset({
                    give: XcmV5AssetFilter.Wild(
                        XcmV5WildAsset.AllOf({
                            id: giveId,
                            fun: XcmV2MultiassetWildFungibility.Fungible(),
                        }),
                    ),
                    want: [{
                        id: wantId,
                        fun: wantFun,
                    }],
                    maximal: false,
                }),

                XcmV5Instruction.InitiateReserveWithdraw({
                    assets: XcmV5AssetFilter.Wild(
                        XcmV5WildAsset.AllOf({
                            id: wantId,
                            fun: XcmV2MultiassetWildFungibility.Fungible(),
                        }),
                    ),
                    reserve: {
                        parents: 1,
                        interior: XcmV5Junctions.X1(
                            XcmV5Junction.Parachain(1000),
                        ),
                    },
                    xcm: [
                        XcmV5Instruction.BuyExecution({
                            fees: {
                                id: wantId,
                                fun: wantFun,
                            },
                            weight_limit: XcmV3WeightLimit.Unlimited(),
                        }),

                        XcmV5Instruction.DepositAsset({
                            assets: XcmV5AssetFilter.Wild(
                                XcmV5WildAsset.AllOf({
                                    id: wantId,
                                    fun: XcmV2MultiassetWildFungibility.Fungible(),
                                }),
                            ),
                            beneficiary,
                        }),

                        XcmV5Instruction.SetTopic(Binary.fromHex(expectedMessageId)),
                    ],
                }),
            ],
        }),

        XcmV5Instruction.SetTopic(Binary.fromHex(expectedMessageId)),
    ]);

    const weight: any =
        await para1Api.apis.XcmPaymentApi.query_xcm_weight(message);
    if (weight.success !== true) {
        console.error("❌ Failed to query XCM weight:", weight.error);
        para1Client.destroy();
        return;
    }

    const tx: any = para1Api.tx.PolkadotXcm.execute({
        message,
        max_weight: weight.value,
    });
    const decodedCall = tx.decodedCall as any;
    console.log("👀 Executing XCM:", JSON.stringify(decodedCall, toHuman, 2));

    try {
        const dryRunResult: any = await para1Api.apis.DryRunApi.dry_run_call(
            origin,
            decodedCall,
            XCM_VERSION,
        );
        console.log("📦 Dry run result:", JSON.stringify(dryRunResult.value, toHuman, 2));

        const executionResult = dryRunResult.value.execution_result;
        if (!dryRunResult.success || !executionResult.success) {
            console.error("❌ Local dry run failed!");
        } else {
            console.log("✅ Local dry run successful.");

            const emittedEvents: [any] = dryRunResult.value.emitted_events;
            const polkadotXcmSentEvent = emittedEvents.find(event =>
                event.type === "PolkadotXcm" && event.value.type === "Sent"
            );
            if (polkadotXcmSentEvent === undefined) {
                console.log(`⚠️ PolkadotXcm.Sent is available in runtimes built from stable2503-5 or later.`);
            } else {
                let para2BlockBefore = await para2Client.getFinalizedBlock();
                const extrinsic = await tx.signAndSubmit(aliceSigner);
                const para1Block = extrinsic.block;
                console.log(`📦 Finalised on ${para1Name} in block #${para1Block.number}: ${para1Block.hash}`);

                if (!extrinsic.ok) {
                    const dispatchError = extrinsic.dispatchError;
                    if (dispatchError.type === "Module") {
                        const modErr: any = dispatchError.value;
                        console.error(`❌ Dispatch error in module: ${modErr.type} → ${modErr.value?.type}`);
                    } else {
                        console.error("❌ Dispatch error:", JSON.stringify(dispatchError, toHuman, 2));
                    }
                }

                const sentEvents = await para1Api.event.PolkadotXcm.Sent.pull();
                if (sentEvents.length > 0) {
                    const sentMessageId = sentEvents[0].payload.message_id.asHex();
                    console.log(`📣 Last message sent on ${para1Name}: ${sentMessageId}`);
                    if (sentMessageId === expectedMessageId) {
                        console.log(`✅ Sent Message ID on ${para1Name} matched.`);
                    } else {
                        console.error(`❌ Sent Message ID [${sentMessageId}] on ${para1Name} doesn't match expexted Message ID [${expectedMessageId}].`);
                    }
                    await assertProcessedMessageId(para2Client, para2Api, para2Name, para2BlockBefore, expectedMessageId);
                    await assertProcessedMessageId(para1Client, para1Api, para1Name, para1Block, expectedMessageId);
                } else {
                    console.log(`📣 No Sent events on ${para1Name} found.`);
                }
            }
        }
    } finally {
        para1Client.destroy();
        para2Client.destroy();
    }
}

main().catch(console.error);
