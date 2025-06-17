import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { RulesEngine } from '../../lib/rulesEngine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shopId } = req.query;
    const cartData = req.body;

    if (!shopId || typeof shopId !== 'string') {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    // Get all active rules for the shop
    const rules = await prisma.rule.findMany({
      where: {
        shopId,
        isActive: true,
      },
      orderBy: {
        priority: 'asc',
      },
    });

    // Convert Date objects to ISO strings
    const rulesWithStringDates = rules.map(rule => ({
      ...rule,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString()
    }));

    // Evaluate rules
    const engine = new RulesEngine(rulesWithStringDates);
    const message = engine.evaluateCart(cartData);

    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error evaluating cart rules:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 