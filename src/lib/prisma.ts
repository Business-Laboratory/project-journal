import { PrismaClient } from '@prisma/client'

export { prisma, getUser }
declare global {
  var prismaClient: PrismaClient
}

let prisma: PrismaClient
// check to use this workaround only in development and not in production
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prismaClient) {
    global.prismaClient = new PrismaClient()
  }
  prisma = global.prismaClient
}

export default prisma

async function getUser(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user === null) {
    throw new Error(`No user found`)
  }

  return user
}
