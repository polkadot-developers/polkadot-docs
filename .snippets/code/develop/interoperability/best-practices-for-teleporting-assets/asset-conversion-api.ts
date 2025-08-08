import { ah } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

const client = createClient(
  getWsProvider('wss://asset-hub-paseo.dotters.network')
);
const api = client.getTypedApi(ah);

const feeInAsset =
  await api.apis.AssetConversionApi.quote_price_exact_tokens_for_tokens(
    assetIn,
    assetOut,
    amountIn
  );
