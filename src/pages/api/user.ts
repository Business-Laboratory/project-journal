import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@lib/prisma'
import type { UnwrapPromise } from '@types'

export type UserData = UnwrapPromise<ReturnType<typeof getUser>>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const email = req.body.email
  if (!email) {
    res.status(501).json({ error: `No email given` })
  }

  try {
    const user = await getUser(req.body.email)
    res.status(200).json(user)
  } catch (error) {
    res.status(501).json({ error: `No user found` })
  }
}

async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      projects: true,
      employee: true,
    },
  })

  if (user === null) {
    throw new Error(`No user found`)
  }

  return user
}
