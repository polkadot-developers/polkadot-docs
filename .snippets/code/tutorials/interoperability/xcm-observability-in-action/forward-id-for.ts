import {blake2AsU8a} from "@polkadot/util-crypto";
import {hexToU8a, stringToU8a, u8aConcat, u8aToHex} from "@polkadot/util";

function forwardIdFor(originalMessageId: string): string {
    // Decode the hex original_id into bytes
    const messageIdBytes = hexToU8a(originalMessageId);

    // Create prefixed input: b"forward_id_for" + original_id
    const prefix = stringToU8a("forward_id_for");
    const input = u8aConcat(prefix, messageIdBytes);

    // Hash it using blake2_256
    const forwardedIdBytes = blake2AsU8a(input);

    // Convert to hex
    return u8aToHex(forwardedIdBytes);
}

// Example: Forwarded ID from a original_id
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