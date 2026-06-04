import { createLocalKvStore } from "@parity/product-sdk-local-storage";
import type { LocalKvStore } from "@parity/product-sdk-local-storage";

// Auto-detects Host backend when running inside a Polkadot Product,
// or falls back to a browser-based backend otherwise.
const store: LocalKvStore = await createLocalKvStore();
