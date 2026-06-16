import { createLocalKvStore } from '@parity/product-sdk-local-storage';
import type { LocalKvStore } from '@parity/product-sdk-local-storage';

// Connects to the Host storage backend. Must run inside a Polkadot Product;
// outside a host container this throws "Host storage unavailable".
const store: LocalKvStore = await createLocalKvStore();
