import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from '@lib/prisma'

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Providers.Email({
      server: process.env.EMAIL_SERVER_TEMP ?? '',
      from: process.env.EMAIL_FROM_TEMP,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
})
