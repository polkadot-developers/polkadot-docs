```ts
export type ConstructedFormat<T> = T extends 'payload'
  ? GenericExtrinsicPayload
  : T extends 'call'
  ? `0x${string}`
  : T extends 'submittable'
  ? SubmittableExtrinsic<'promise', ISubmittableResult>
  : never;
```

The `ConstructedFormat` type is a conditional type that returns a specific type based on the value of the TxResult `format` field.

- Payload format - if the format field is set to `'payload'`, the `ConstructedFormat` type will return a [`GenericExtrinsicPayload`](https://github.com/polkadot-js/api/blob/3b7b44f048ff515579dd233ea6964acec39c0589/packages/types/src/extrinsic/ExtrinsicPayload.ts#L48){target=_blank}
- Call format - if the format field is set to `'call'`, the `ConstructedFormat` type will return a hexadecimal string (`0x${string}`). This is the encoded representation of the extrinsic call
- Submittable format - if the format field is set to `'submittable'`, the `ConstructedFormat` type will return a [`SubmittableExtrinsic`](https://github.com/polkadot-js/api/blob/3b7b44f048ff515579dd233ea6964acec39c0589/packages/api-base/src/types/submittable.ts#L56){target=_blank}. This is a Polkadot.js type that represents a transaction that can be submitted to the blockchain