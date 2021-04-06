import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const email = req.body.email
  if (!email) {
    res.status(501).json({ error: `No email given` })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
    include: {
      projects: true,
      employee: true,
    },
  })
  if (user) {
    res.status(200).json(user)
  } else {
    res.status(501).json({ error: `No user found` })
  }
}
