'use client';

import { useProductSDK } from '@parity/product-sdk/react';

function StorageActions() {
  const app = useProductSDK();

  async function handleRemove() {
    await app.localStorage.remove('network');
  }

  async function handleClear() {
    // Removes every key scoped to this Product.
    await app.localStorage.clear();
  }

  return (
    <div>
      <button onClick={handleRemove}>Remove &quot;network&quot;</button>
      <button onClick={handleClear}>Clear all</button>
    </div>
  );
}
