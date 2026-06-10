'use client';

import { ProductSDKProvider } from '@parity/product-sdk/react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProductSDKProvider
      name="my-product"
      fallback={<div>Initializing SDK…</div>}
    >
      {children}
    </ProductSDKProvider>
  );
}
