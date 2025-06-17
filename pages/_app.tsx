import React from 'react';
import { AppProps } from 'next/app';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
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