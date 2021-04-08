import { prisma } from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { name } = req.body
    const client = await prisma.client.create({
      data: { name },
    })
    res.status(200).json(client)
  }
}
