import { NextApiRequest, NextApiResponse } from 'next';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shop_id, shop_domain, access_token } = req.body;

    if (!shop_id || !shop_domain || !access_token) {
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

    // Check if script tag already exists
    const existingScripts = await client.get({
      path: 'script_tags',
      query: { src: `${process.env.SHOPIFY_APP_URL}/cart-note-replacer.js` }
    });

    if (existingScripts.body.script_tags.length === 0) {
      // Create new script tag
      await client.post({
        path: 'script_tags',
        data: {
          script_tag: {
            event: 'onload',
            src: `${process.env.SHOPIFY_APP_URL}/cart-note-replacer.js`,
            display_scope: 'order_status',
            cache: false
          }
        }
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error managing script tag:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 