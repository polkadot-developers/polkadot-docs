import {
  AssetTransferApi,
  constructApiPromise,
} from "@substrate/asset-transfer-api";

async function main() {
  const { api, specName, safeXcmVersion } = await constructApiPromise(
    "INSERT_WEBSOCKET_URL"
  );

  const assetsApi = new AssetTransferApi(api, specName, safeXcmVersion);

  // Your code using assetsApi goes here
}

main();
