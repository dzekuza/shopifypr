import React, { useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import { useRouter } from 'next/router';

function useEnsureHost() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('host');
      const shop = params.get('shop');
      if (!host && shop) {
        // Redirect to Shopify OAuth to get host
        window.location.href = `/api/auth?shop=${shop}`;
      }
    }
  }, [router]);
}

function MyApp({ Component, pageProps }: AppProps) {
  useEnsureHost();
  const [host, setHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setHost(params.get('host') || '');
    }
  }, []);

  const config = {
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
    host,
    forceRedirect: true,
  };

  return (
    <AppBridgeProvider config={config}>
      <PolarisProvider i18n={en}>
        <Component {...pageProps} />
      </PolarisProvider>
    </AppBridgeProvider>
  );
}

export default MyApp; 