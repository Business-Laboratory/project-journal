import { prisma } from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { name, imageUrl, description, clientId } = req.body
    const project = await prisma.project.create({
      data: {
        name: name,
        imageUrl: imageUrl,
        summary: {
          create: {
            description: description,
          },
        },
        client: {
          connect: {
            id: clientId,
          },
        },
      },
    })
    res.status(200).json(project)
  }
}
