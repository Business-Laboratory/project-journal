import { PrismaClient } from '@prisma/client'

export { prisma }
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
