```ts
export type AssetTransferType =
  | LocalReserve
  | DestinationReserve
  | Teleport
  | RemoteReserve;
```

!!! note
    To use the `assetTransferType` parameter, which is a string, you should use the `AssetTransferType` type as if each of its variants are strings. For example: `assetTransferType = 'LocalReserve'`.