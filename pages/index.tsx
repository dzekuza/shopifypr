import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const shop = params.get('shop');
      if (shop) {
        // Start OAuth flow to get host
        window.location.href = `/api/auth?shop=${shop}`;
      } else {
        // Show a message if not accessed from Shopify
        alert('This app must be accessed from the Shopify admin.');
      }
    }
  }, [router]);

  return null;
} 