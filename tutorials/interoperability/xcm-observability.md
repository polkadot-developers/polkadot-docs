# 🔭 XCM Observability

When sending XCMs using `limited_reserve_transfer_assets` or other calls from the  `PolkadotXcm` pallet, two observability features help trace and correlate messages across chains:

* [`SetTopic([u8; 32])`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/opaque/type.Instruction.html#variant.SetTopic) - An XCM instruction that sets the Topic Register. This 32-byte array is used as the `message_id`, which appears in both `Sent` and `Processed` events. The topic enables logical grouping or filtering of related XCMs across multiple hops.
  > ⚠️ **Note**: The topic is **not guaranteed to be unique**. If uniqueness is required (e.g. for deduplication or tracing), it must be enforced by the message creator.
* **`message_id`** - A hash emitted in both the[`PolkadotXcm.Sent`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Event.html#variant.Sent) event (on the origin chain) and the [`MessageQueue.Processed`](https://paritytech.github.io/polkadot-sdk/master/pallet_message_queue/pallet/enum.Event.html#variant.Processed) event (on the destination chain). While this ID is not globally unique, it **suffices to correlate a `Sent` message with its matching `Processed` result**.

## 🔄 Message Lifecycle

### ▶️ Execute Sample Script

Assuming you're familiar with how to replay a forked chain using [Chopsticks](https://docs.polkadot.com/develop/toolkit/parachains/fork-chains/chopsticks/get-started/). If not, refer to the [guide](../README.md) for setup instructions.

* [`hydration-sample1.ts`](../src/hydration-sample1.ts)
* [`limited-reserve-transfer-assets.ts`](../src/limited-reserve-transfer-assets.ts)
* [`multiple-hops-sample-01.ts`](../src/multiple-hops-sample-01.ts)
* [`multiple-hops-sample-02.ts`](../src/multiple-hops-sample-02.ts)

```bash
npx ts-node src/limited-reserve-transfer-assets.ts
```

### ✅ Local XCM (on origin chain - e.g., Polkadot Asset Hub)

```json
{
  "type": "TransferAsset",
  "value": {
    "assets": [...],
    "beneficiary": {...}
  }
}
```

### 🚀 Forwarded XCM (to destination - e.g., Acala)

The runtime automatically appends a `SetTopic`:

```json
[
  {
    "type": "ReserveAssetDeposited",
    "value": [...]
  },
  {
    "type": "ClearOrigin"
  },
  {
    "type": "BuyExecution",
    "value": {...}
  },
  {
    "type": "DepositAsset",
    "value": {...}
  },
  {
    "type": "SetTopic",
    "value": "0xb4b8d2c87622cbad983d8f2c92bfe28e12d587e13d15ea4fdabe8f771bf86bce"
  }
]
```

This forwarded message lands on the destination chain (Acala) and is processed accordingly.

Here’s an updated version of your section to reflect the current state of XCM message tracking across chains more clearly and accurately:

### 🔍 Event Correlation Flow

| Chain                               | Event                    | Field        | Description                                                                |
| ----------------------------------- | ------------------------ | ------------ | -------------------------------------------------------------------------- |
| Origin (e.g. Asset Hub)             | `PolkadotXcm.Sent`       | `message_id` | Message ID from `SetTopic`. Appended automatically if missing.             |
| Destination (e.g. Acala, Hydration) | `MessageQueue.Processed` | `id`         | Matches `message_id` from the origin chain, enabling reliable correlation. |

✅ **These two fields now match** on new runtimes (`stable2503-5` or later).

> ⚠️ Do **not** rely on [`XcmpQueue.XcmpMessageSent`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_xcmp_queue/pallet/enum.Event.html#variant.XcmpMessageSent). Its `message_hash` is **not correlated** with `message_id` and is **not suitable** for cross-chain tracking.

### 🛠 Example: Message Trace Output

```console
✅ Local dry run successful.
📦 Finalised on Polkadot Asset Hub in block #9079592: 0x6de0cd268f07ec040a69dbbcb81f86c6fc4954dfa7fc914edd5dae1e3f235083
📣 Last message Sent on Polkadot Asset Hub: 0xb4b8d2c87622cbad983d8f2c92bfe28e12d587e13d15ea4fdabe8f771bf86bce
📦 Finalised on Acala in block #8826386: 0xfda51e7e411ee59c569fc051ef51431b04edebcc5d45d7b1d1bdfcce9627638a
📣 Last message Processed on Acala: 0xb4b8d2c87622cbad983d8f2c92bfe28e12d587e13d15ea4fdabe8f771bf86bce
✅ Message ID matched.
```

### 🚨 Failure Event Handling

**Important:** When an XCM transaction fails, it is **rolled back**, meaning **no failure events are emitted on-chain**. However, failure details are still observable through other methods.

#### 📦 Indexer View: Nested Error Only

Most indexers will display **nested error information**, such as `LocalExecutionIncompleteWithError`. This can be helpful for high-level diagnosis, and is **usually sufficient** to understand what went wrong.

#### 🧪 Deeper Insight: Use Chopsticks for Full Detail

For **in-depth debugging**, especially when the nested error is vague, use [`Chopsticks`](https://github.com/AcalaNetwork/chopsticks):

* Run a replay with full logging to see **which instruction failed**, and why.
* View inner `FailedToTransactAsset`, `AssetNotFound` or nested error.
* Supports debugging multi-hop XCMs and complex failure scenarios.

Example:

```json
"error": {
  "type": "Module",
  "value": {
    "type": "PolkadotXcm",
    "value": {
      "type": "LocalExecutionIncompleteWithError",
      "value": {
        "index": 0,
        "error": {
          "type": "FailedToTransactAsset"
        }
      }
    }
  }
}
```

#### 🛠 Recommended Debugging Workflow

1. **Look at the indexer first** to see if the nested error gives enough context.
2. If not, **run a replay in Chopsticks** with logging enabled.
3. Check node logs to correlate where and why execution failed.
4. Analyse inner errors (e.g., weight too low, asset mismatch, missing buy execution).

➡️ For full logging setup, see [this guide](https://docs.polkadot.com/tutorials/interoperability/replay-and-dry-run-xcms/).

## 🧠 Notes

* `SetTopic` is always **appended as the final instruction** by the runtime [if not already present](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.WithUniqueTopic.html).
* When using high-level extrinsics like `limited_reserve_transfer_assets`, you do **not** need to add `SetTopic` manually. The runtime ensures it's included.
* If you manually construct XCM using `execute`, you **can include your own `SetTopic([u8; 32])`** to explicitly tag or group a message.
  * If `SetTopic` is already present, it will **not be overridden**.
  * Best practice: **Place `SetTopic` at the end** of your instruction list to align with runtime expectations.
* On **newer runtimes**, the same topic is **preserved end-to-end** across all chains involved in a multi-hop transfer. This ensures consistent `message_id` correlation between `Sent` and `Processed` events.

### 🏷️ Manually Setting `SetTopic` for Cross-Chain Tracking

In multi-hop XCM flows, you may wish to **manually assign a `SetTopic` ID** to **correlate the same message across all involved chains**, especially when you want to track or trace it later.

This is optional. If `SetTopic` is not included, a topic ID will be generated automatically based on the message contents. However, this auto-generated ID is **not guaranteed to be unique**. If uniqueness is important (e.g. for deduplication or traceability), it must be enforced by the message creator.

💡 This pattern is demonstrated in [`multiple-hops-sample-02.ts`](../src/multiple-hops-sample-02.ts), which sends DOT from Asset Hub, swaps it on Hydration, and returns the result, all under a known `message_id`.

✍️ Example: Multi-Hop XCM with Fixed `SetTopic`

```ts
const message = XcmVersionedXcm.V5([
  // Local instructions...

  // Remote hop to Hydration
  XcmV5Instruction.DepositReserveAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.All()),
    dest: { interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(2034)), parents: 1, },
    xcm: [
      // remote instructions...
    ]
  }),

  // Optional: explicitly set topic ID for tracing
  XcmV5Instruction.SetTopic(
    Binary.fromHex("0x836c6039763718fd3db4e22484fc4bacd7ddf1c74b6067d15b297ea72d8ecf89")
  ),
]);
```

📦 Example log output:

```console
📦 Finalised on Polkadot Asset Hub in block #9294993: 0xa4e15ad6eae7fcd837f7a7c02a1925165bd97597fbe1ceb74adc17d3cbcf34bd
📣 Last message Sent on Polkadot Asset Hub: 0x836c6039763718fd3db4e22484fc4bacd7ddf1c74b6067d15b297ea72d8ecf89
✅ Sent message ID matched.
📦 Finalised on Hydration in block #8377216: 0x6bb6e7d69c2d574f8646f3c739d872ab832850a44659ea9401249dbe11a4c447
📣 Last message Processed on Hydration: 0x836c6039763718fd3db4e22484fc4bacd7ddf1c74b6067d15b297ea72d8ecf89
✅ Processed Message ID matched.
```

### 🧩 Workaround for Older Runtimes

* On **older runtimes** (prior to [fix #759](https://github.com/polkadot-fellows/runtimes/pull/759) in `stable2503-5`), the `message_id` seen in downstream `Processed` events is **not the original topic hash**, but rather a **derived `forwarded_id`**.
* This `forwarded_id` is computed as:

```rust
use sp_core::H256;
use std::str::FromStr;

fn forward_id_for(original_id: &XcmHash) -> XcmHash {
  (b"forward_id_for", original_id).using_encoded(sp_io::hashing::blake2_256)
}
```

* To reliably trace messages across **mixed-version chains**, indexers and tools should **check for both `original_id` and its forwarded form**.
* Reference: [`forward-id-for.ts`](../src/forward-id-for.ts) contains a helper function to compute this.

```ts
// Create prefixed input: b"forward_id_for" + original_id
const prefix = stringToU8a("forward_id_for");
const input = u8aConcat(prefix, messageIdBytes);

// Hash it using blake2_256
const forwardedIdBytes = blake2AsU8a(input);
```

* ✅ **New runtimes**:
  `message_id == original_id`

* ⚠️ **Old runtimes**:
  `message_id == blake2_256("forward_id_for" + original_id)`

## 📚 References

* [polkadot-sdk#6119 - [XCM] Observability & Debuggability](https://github.com/paritytech/polkadot-sdk/issues/6119)
* [polkadot-sdk#7234 - Add EventEmitter to XCM Executor](https://github.com/paritytech/polkadot-sdk/pull/7234)
* [polkadot-sdk#7730 - Nest Errors in `pallet-xcm`](https://github.com/paritytech/polkadot-sdk/pull/7730)
* [polkadot-sdk#7691 - Ensure Consistent Topic IDs for Traceable Cross-Chain XCM](https://github.com/paritytech/polkadot-sdk/pull/7691)
* [Replay and Dry Run XCMs Using Chopsticks](https://docs.polkadot.com/tutorials/interoperability/replay-and-dry-run-xcms/)
