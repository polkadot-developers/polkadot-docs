import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    "wss://westend-rpc.polkadot.io"
  );
  const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
  let callInfo;
  try {
    callInfo = await assetApi.createTransferTransaction(
      "1000",
      "5EWNeodpcQ6iYibJ3jmWVe85nsok1EDG8Kk3aFg8ZzpfY1qX",
      ["WND"],
      ["1000000000000"],
      {
        format: "call",
        xcmVersion: safeXcmVersion,
      }
    );

    console.log(`Call data:\n${JSON.stringify(callInfo, null, 4)}`);
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }

  const decoded = assetApi.decodeExtrinsic(callInfo.tx, "call");
  console.log(`\nDecoded tx:\n${JSON.stringify(JSON.parse(decoded), null, 4)}`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());
