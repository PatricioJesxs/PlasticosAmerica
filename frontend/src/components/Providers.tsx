'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth';
import { QuoteProvider } from '@/lib/quote';
import QuoteDrawer from '@/components/QuoteDrawer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QuoteProvider>
        {children}
        <QuoteDrawer />
      </QuoteProvider>
    </AuthProvider>
  );
}
