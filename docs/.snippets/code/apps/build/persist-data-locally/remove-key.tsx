'use client';

import { useProductSDK } from '@parity/product-sdk/react';

function StorageActions() {
  const app = useProductSDK();

  async function handleRemove() {
    await app.localStorage.remove('network');
  }

  return (
    <div>
      <button onClick={handleRemove}>Remove &quot;network&quot;</button>
    </div>
  );
}
