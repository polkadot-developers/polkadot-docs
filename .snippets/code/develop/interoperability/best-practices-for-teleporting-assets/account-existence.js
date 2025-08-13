const { ApiPromise, WsProvider } = require('@polkadot/api');
const provider = new WsProvider('wss://rpc.polkadot.io');
const api = await ApiPromise.create({ provider });

async function checkAccountExistence(api, address) {
  const accountInfo = await api.query.system.account(address);
  const balance = accountInfo.data.free.toBigInt();
  const existentialDeposit = api.consts.balances.existentialDeposit.toBigInt();

  return {
    exists: !accountInfo.isEmpty,
    balance,
    hasExistentialDeposit: balance >= existentialDeposit,
  };
}
