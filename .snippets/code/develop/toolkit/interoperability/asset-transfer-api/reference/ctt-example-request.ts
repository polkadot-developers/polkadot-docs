import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    "wss://wss.api.moonbeam.network"
  );
  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  let callInfo;
  try {
    callInfo = await assetsApi.createTransferTransaction(
      "2004",
      "0xF977814e90dA44bFA03b6295A0616a897441aceC",
      [],
      ["1000000000000000000"],
      {
        format: "call",
        keepAlive: true,
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
