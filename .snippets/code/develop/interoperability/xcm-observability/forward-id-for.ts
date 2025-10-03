import {blake2b} from "@noble/hashes/blake2";
import {fromHex, mergeUint8, toHex} from "@polkadot-api/utils";
import {Binary} from "polkadot-api";

function forwardIdFor(originalMessageId: string): string {
    // Decode the hex original_id into bytes
    const messageIdBytes = fromHex(originalMessageId);

    // Create prefixed input: b"forward_id_for" + original_id
    const prefix = Binary.fromText("forward_id_for").asBytes();
    const input = mergeUint8([prefix, messageIdBytes]);

    // Hash it using blake2b with 32-byte output
    const forwardedIdBytes = blake2b(input, {dkLen: 32});
    // Convert to hex
    return toHex(forwardedIdBytes);
}

// Example: Forwarded ID from an original_id
const originalMessageId = "0x5c082b4750ee8c34986eb22ce6e345bad2360f3682cda3e99de94b0d9970cb3e";

// Create the forwarded ID
const forwardedIdHex = forwardIdFor(originalMessageId);

console.log("🔄 Forwarded ID:", forwardedIdHex);

const expectedForwardedId = "0xb3ae32fd2e2f798e8215865a8950d19df8330843608d4ee44e9f86849029724a";
if (forwardedIdHex === expectedForwardedId) {
    console.log("✅ Forwarded ID matches expected value.");
} else {
    console.error("❌ Forwarded ID does not match expected value.");
}