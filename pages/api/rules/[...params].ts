import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params } = req.query;
  const [ruleId] = params as string[];

  try {
    switch (req.method) {
      case 'GET':
        if (ruleId) {
          const rule = await prisma.rule.findUnique({
            where: { id: ruleId },
          });
          return res.status(200).json(rule);
        } else {
          const rules = await prisma.rule.findMany({
            orderBy: { priority: 'desc' },
          });
          return res.status(200).json(rules);
        }

      case 'POST':
        const newRule = await prisma.rule.create({
          data: {
            ...req.body,
            condition: req.body.condition as any,
          },
        });
        return res.status(201).json(newRule);

      case 'PUT':
        if (!ruleId) {
          return res.status(400).json({ error: 'Rule ID is required' });
        }
        const updatedRule = await prisma.rule.update({
          where: { id: ruleId },
          data: {
            ...req.body,
            condition: req.body.condition as any,
          },
        });
        return res.status(200).json(updatedRule);

      case 'DELETE':
        if (!ruleId) {
          return res.status(400).json({ error: 'Rule ID is required' });
        }
        await prisma.rule.delete({
          where: { id: ruleId },
        });
        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Error handling rule:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 