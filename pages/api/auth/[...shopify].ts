import { NextApiRequest, NextApiResponse } from 'next';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import prisma from '../../../lib/prisma';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: [
    'read_products',
    'read_customers',
    'read_orders',
    'write_orders',
    'read_themes',
    'write_script_tags',
    'read_script_tags',
  ],
  hostName: process.env.SHOPIFY_APP_URL!.replace(/^https?:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: LATEST_API_VERSION,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { shopify: shopifyPath } = req.query as { shopify: string[] };

  if (shopifyPath[0] === 'callback') {
    try {
      const { session } = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      if (!session.accessToken) {
        throw new Error('No access token found in session');
      }

      // Store shop data in database
      await prisma.shop.upsert({
        where: { shopDomain: session.shop },
        create: {
          id: session.shop,
          shopDomain: session.shop,
          accessToken: session.accessToken,
        },
        update: {
          accessToken: session.accessToken,
        },
      });

      // Redirect to app home
      res.redirect(`/admin`);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('OAuth failed');
    }
  } else {
    // Start OAuth
    const shop = req.query.shop;
    if (!shop || typeof shop !== 'string') {
      res.status(400).send('Missing shop parameter');
      return;
    }
    try {
      await shopify.auth.begin({
        shop,
        callbackPath: '/api/auth/callback',
        isOnline: false,
        rawRequest: req,
        rawResponse: res,
      });
      // The begin() method handles the redirect
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('OAuth failed');
    }
  }
};

export default handler; 