import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    "wss://wss.api.moonbeam.network"
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  const encodedExt = "0x0a03f977814e90da44bfa03b6295a0616a897441acec821a0600";

  try {
    const decodedExt = assetsApi.decodeExtrinsic(encodedExt, "call");
    console.log(
      `Decoded tx:\n ${JSON.stringify(JSON.parse(decodedExt), null, 4)}`
    );
  } catch (e) {
    console.error(e);
    throw Error(e as string);
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => process.exit());
