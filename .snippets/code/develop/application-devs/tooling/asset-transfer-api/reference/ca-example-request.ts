import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    "wss://westend-rpc.polkadot.io"
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  let callInfo;
  try {
    callInfo = await assetsApi.claimAssets(
      [
        `{"parents":"0","interior":{"X2":[{"PalletInstance":"50"},{"GeneralIndex":"1984"}]}}`,
      ],
      ["1000000000000"],
      "0xf5d5714c084c112843aca74f8c498da06cc5a2d63153b825189baa51043b1f0b",
      {
        format: "call",
        xcmVersion: 2,
      }
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());
