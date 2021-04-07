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
    Providers.AzureADB2C({
      clientId: process.env.AZURE_CLIENT_ID ?? '',
      clientSecret: process.env.AZURE_CLIENT_SECRET ?? '',
      scope: 'offline_access User.Read',
      tenantId: process.env.AZURE_TENANT_ID,
    }),
    Providers.Email({
      server: process.env.EMAIL_SERVER ?? '',
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
})
