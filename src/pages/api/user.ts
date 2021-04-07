import prisma from '@lib/prisma'
import { getSession } from 'next-auth/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'

export type UserData = UnwrapPromise<ReturnType<typeof getUser>>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  if (!session) {
    res.status(401).json({ error: 'User is not authorized' })
    return
  }
  const email = req.body.email
  if (!email) {
    res.status(501).json({ error: `No email given` })
    return
  }

  try {
    const user = await getUser(req.body.email)

    if (user.role === null) {
      res.status(401).json({ error: 'User is not authorized' })
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(501).json({ error: `No user found` })
  }
}

async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user === null) {
    throw new Error(`No user found`)
  }

  return user
}
