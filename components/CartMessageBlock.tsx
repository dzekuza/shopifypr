import React, { useEffect, useState } from 'react';

interface CartMessageBlockProps {
  shopId: string;
}

const CartMessageBlock: React.FC<CartMessageBlockProps> = ({ shopId }) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndEvaluateRules = async () => {
      try {
        // Get cart data from Shopify
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();

        // Get customer data if available
        const customerTags = (window as any).customerTags || [];
        const countryCode = (window as any).Shopify?.country || '';

        // Format cart data for rules engine
        const cartData = {
          total: cart.total_price / 100, // Convert to dollars
          items: cart.items.map((item: any) => ({
            productId: item.product_id,
            variantId: item.variant_id,
            quantity: item.quantity,
            collectionIds: item.collection_ids || [],
          })),
          customerTags,
          countryCode,
        };

        // Fetch applicable message from our API
        const response = await fetch(`/api/evaluate-cart?shopId=${shopId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cartData),
        });

        const { message } = await response.json();
        setMessage(message);
      } catch (error) {
        console.error('Error evaluating cart rules:', error);
      }
    };

    // Initial evaluation
    fetchAndEvaluateRules();

    // Listen for cart updates
    document.addEventListener('cart:updated', fetchAndEvaluateRules);
    return () => {
      document.removeEventListener('cart:updated', fetchAndEvaluateRules);
    };
  }, [shopId]);

  if (!message) return null;

  return (
    <div
      className="cart-message-block"
      style={{
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: '4px',
        backgroundColor: '#f4f4f4',
        border: '1px solid #e0e0e0',
      }}
      dangerouslySetInnerHTML={{ __html: message }}
    />
  );
};

export default CartMessageBlock; 