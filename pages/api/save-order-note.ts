import { NextApiRequest, NextApiResponse } from 'next';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop_id, shop_domain, access_token, order_id, message } = req.body;

    if (!shop_id || !shop_domain || !access_token || !order_id || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY!,
      apiSecretKey: process.env.SHOPIFY_API_SECRET!,
      scopes: process.env.SCOPES!.split(','),
      hostName: shop_domain,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
    });

    const session = new Session({
      id: `${shop_domain}_${shop_id}`,
      shop: shop_domain,
      state: shop_id,
      isOnline: true,
      accessToken: access_token,
    });

    const client = new shopify.clients.Rest({ session });

    // Save message as order note
    await client.put({
      path: `orders/${order_id}`,
      data: {
        order: {
          id: order_id,
          note: `Cart Message: ${message}`,
        },
      },
    });

    // Save message as order metafield
    await client.post({
      path: `orders/${order_id}/metafields`,
      data: {
        metafield: {
          namespace: 'cart_note_replacer',
          key: 'displayed_message',
          value: message,
          type: 'single_line_text_field',
        },
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving order note:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 