import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

const client = createClient(getWsProvider('wss://rpc.polkadot.io'));
const api = client.getTypedApi(dot);

const feeDetails = await api.apis.TransactionPaymentApi.query_fee_details(
  call.toHex(),
  call.encodedLength
);
