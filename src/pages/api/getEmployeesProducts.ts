import { getEmployeesProducts, getUser } from '@lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { UnwrapPromise } from '@types'

export type UserData = UnwrapPromise<ReturnType<typeof getUser>>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const employeesProducts = await getEmployeesProducts(
      Number(req.body.userId)
    )
    res.status(200).json(employeesProducts)
  } catch (error) {
    res.status(501).json({ error: `No user found` })
  }
}
