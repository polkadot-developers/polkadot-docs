import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';

const client = createClient(getWsProvider('wss://rpc.polkadot.io'));
const api = client.getTypedApi(dot);

const xcm = XcmVersionedXcm.V5([...]);

// These will be set if the runtime API calls are successful.
let localExecutionFees = 0;
// We query the weight of the xcm.
const weightResult = await api.apis.XcmPaymentApi.query_xcm_weight(xcm);
if (weightResult.success) {
    // We convert the weight to a fee amount.
    // The asset is { parents: 1, interior: Here }, aka, DOT.
    const executionFeesResult = await api.apis.XcmPaymentApi.query_weight_to_asset_fee(
        weightResult.value,
        XcmVersionedAssetId.V5({
            parents: 1,
            interior: XcmV3Junctions.Here(),
        }),
    );
    if (executionFeesResult.success) {
        localExecutionFees = executionFeesResult.value;
    }
}
