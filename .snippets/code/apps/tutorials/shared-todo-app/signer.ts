import type { App } from './types';

/** Identity for the current participant on the board. */
export interface BoardIdentity {
  /** SS58 address used as the todo author and signing identity. */
  address: string;
  /** Display name reported by the provider, if any. */
  name?: string;
  /** True when the address is a product-scoped account from the host. */
  isProductAccount: boolean;
}

/**
 * Connect to the host, select the first available account, and resolve the
 * identity used for the board. Prefers the product-scoped account when the
 * app runs inside a host container; falls back to the selected account.
 */
export async function connectIdentity(app: App): Promise<BoardIdentity> {
  const { accounts } = await app.wallet.connect();
  if (accounts.length === 0) {
    throw new Error('No accounts available from the host');
  }

  if (!app.wallet.getSelectedAccount()) {
    app.wallet.selectAccount(accounts[0].address);
  }

  const productAccount = app.wallet.getProductAccount();
  if (productAccount) {
    return {
      address: productAccount.address,
      name: productAccount.name,
      isProductAccount: true,
    };
  }

  const selected = app.wallet.getSelectedAccount() ?? accounts[0];
  return {
    address: selected.address,
    name: selected.name,
    isProductAccount: false,
  };
}
