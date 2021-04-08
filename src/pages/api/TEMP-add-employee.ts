import { prisma } from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, role, clientId } = req.body
    const client = await prisma.user.update({
      where: {
        email,
      },
      data: {
        role,
        employee: {
          create: {
            title: 'Employee of the month',
            Client: {
              connect: {
                id: clientId,
              },
            },
          },
        },
      },
    })
    res.status(200).json(client)
  }
}
