import {Binary, createClient, Enum, Transaction} from "polkadot-api";
import {withPolkadotSdkCompat} from "polkadot-api/polkadot-sdk-compat";
import {getPolkadotSigner} from "polkadot-api/signer";
import {getWsProvider} from "polkadot-api/ws-provider/web";
import {
    assetHub,
    hydration,
    XcmV3MultiassetFungibility,
    XcmV3WeightLimit,
    XcmV5AssetFilter,
    XcmV5Instruction,
    XcmV5Junction,
    XcmV5Junctions,
    XcmV5WildAsset,
    XcmVersionedXcm,
} from "@polkadot-api/descriptors";
import {sr25519CreateDerive} from "@polkadot-labs/hdkd";
import {
    DEV_PHRASE,
    entropyToMiniSecret,
    mnemonicToEntropy,
    ss58Address,
} from "@polkadot-labs/hdkd-helpers";

const XCM_VERSION = 5;

const toHuman = (_key: any, value: any) => {
    if (typeof value === "bigint") {
        return Number(value);
    }

    if (value && typeof value === "object" && typeof value.asHex === "function") {
        return value.asHex();
    }

    return value;
};

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

    const expectedMessageId = "0xd60225f721599cb7c6e23cdf4fab26f205e30cd7eb6b5ccf6637cdc80b2339b2";

    const message = XcmVersionedXcm.V5([
        XcmV5Instruction.WithdrawAsset([
            {
                id: {
                    interior: XcmV5Junctions.Here(),
                    parents: 1,
                },
                fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000n),
            },
        ]),
        XcmV5Instruction.ClearOrigin(),
        XcmV5Instruction.BuyExecution({
            fees: {
                id: {
                    interior: XcmV5Junctions.Here(),
                    parents: 1,
                },
                fun: XcmV3MultiassetFungibility.Fungible(500_000_000n),
            },
            weight_limit: XcmV3WeightLimit.Unlimited(),
        }),
        XcmV5Instruction.DepositReserveAsset({
            assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.All()),
            dest: {
                interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(2034)),
                parents: 1,
            },
            xcm: [
                XcmV5Instruction.BuyExecution({
                    fees: {
                        id: {
                            interior: XcmV5Junctions.Here(),
                            parents: 1,
                        },
                        fun: XcmV3MultiassetFungibility.Fungible(500_000_000n),
                    },
                    weight_limit: XcmV3WeightLimit.Unlimited(),
                }),
                XcmV5Instruction.DepositAsset({
                    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.All()),
                    beneficiary: {
                        interior: XcmV5Junctions.X1(
                            XcmV5Junction.AccountId32({
                                id: Binary.fromHex(
                                    "0x9818ff3c27d256631065ecabf0c50e02551e5c5342b8669486c1e566fcbf847f",
                                ),
                            }),
                        ),
                        parents: 0,
                    },
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

    const tx: Transaction<any, string, string, any> =
        para1Api.tx.PolkadotXcm.execute({
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
                let parachainBlockBefore = await para2Client.getFinalizedBlock();
                const extrinsic = await tx.signAndSubmit(aliceSigner);
                const block = extrinsic.block;
                console.log(`📦 Finalised on ${para1Name} in block #${block.number}: ${block.hash}`);

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
                    console.log(`📣 Last message Sent on ${para1Name}: ${sentMessageId}`);
                    if (sentMessageId === expectedMessageId) {
                        console.log("✅ Sent message ID matched.");
                    } else {
                        console.error("❌ Sent message ID does not match expexted message ID.");
                    }

                    let processedMessageId = undefined;
                    const maxRetries = 8;
                    for (let i = 0; i < maxRetries; i++) {
                        const parachainBlockAfter = await para2Client.getFinalizedBlock();
                        if (parachainBlockAfter.number == parachainBlockBefore.number) {
                            const waiting = 1_000 * (2 ** i);
                            console.log(`⏳ Waiting ${waiting}ms for ${para2Name} block to be finalised (${i + 1}/${maxRetries})...`);
                            await new Promise((resolve) => setTimeout(resolve, waiting));
                            continue;
                        }

                        console.log(`📦 Finalised on ${para2Name} in block #${parachainBlockAfter.number}: ${parachainBlockAfter.hash}`);
                        const processedEvents = await para2Api.event.MessageQueue.Processed.pull();
                        const processingFailedEvents = await para2Api.event.MessageQueue.ProcessingFailed.pull();
                        if (processedEvents.length > 0) {
                            processedMessageId = processedEvents[0].payload.id.asHex();
                            console.log(`📣 Last message Processed on ${para2Name}: ${processedMessageId}`);
                            break;
                        } else if (processingFailedEvents.length > 0) {
                            processedMessageId = processingFailedEvents[0].payload.id.asHex();
                            console.log(`📣 Last message ProcessingFailed on ${para2Name}: ${processedMessageId}`);
                            break;
                        } else {
                            console.log(`📣 No Processed events on ${para2Name} found.`);
                            parachainBlockBefore = parachainBlockAfter; // Update the block before to the latest one
                        }
                    }

                    if (processedMessageId === expectedMessageId) {
                        console.log("✅ Processed Message ID matched.");
                    } else {
                        console.error("❌ Processed Message ID does not match expected Message ID.");
                    }
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
