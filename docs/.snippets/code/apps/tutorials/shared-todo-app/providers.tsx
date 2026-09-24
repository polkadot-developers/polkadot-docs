'use client';

import { ProductSDKProvider } from '@parity/product-sdk/react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProductSDKProvider
      fallback={<div className="p-6 font-mono text-sm">Initializing SDK…</div>}
    >
      {children}
    </ProductSDKProvider>
  );
}
