import tw from 'twin.macro'
import { useState } from 'react'
import Header from 'next/head'
import { signIn } from 'next-auth/client'
import { useAuth } from '@components/auth-context'

function Login() {
  const auth = useAuth()
  if (auth) return null

  return (
    <div tw="relative mx-auto space-y-16 max-w-max top-24">
      <header>
        <h1 tw="bl-text-5xl text-center">Log in</h1>
      </header>
      <main tw="flex flex-col space-y-8">
        <LoginProviderButton onClick={() => signIn('google')}>
          Continue with Google
        </LoginProviderButton>
        <LoginProviderButton>Continue with Microsoft</LoginProviderButton>
        <hr tw="w-full h-0 border-t-2 border-lichen-green-200" />
        <EmailLogin signIn={(email: string) => signIn('email', { email })} />
      </main>
    </div>
  )
}

function LoginProviderButton(props: React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      tw="py-2 px-8 border-2 border-copper-400 bl-text-lg hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)"
      {...props}
    />
  )
}

function EmailLogin({ signIn }: { signIn: (email: string) => void }) {
  const [email, setEmail] = useState('')
  return (
    <div tw="flex flex-col space-y-2">
      <label htmlFor="email-login" tw="bl-text-sm">
        Email
      </label>
      <input
        id="email-login"
        tw="h-12 px-2 border-2 border-copper-400 bl-text-base hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <p tw="text-xs max-w-fit">
        You will be sent a link to a password-free sign in.
      </p>
      <LoginProviderButton
        css={[
          !email
            ? tw`bg-gray-red-200 text-gray-yellow-500 hover:(ring-0) focus:(ring-0)`
            : null,
        ]}
        onClick={() => {
          if (!email) return
          signIn(email)
        }}
      >
        Sign in with Email
      </LoginProviderButton>
    </div>
  )
}

// TODO: move all common page layout elements to either a shared component or `pages/_app.tsx`
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <title>Login | Project Journal</title>
      </Header>
      <div tw="bg-gray-yellow-100 text-gray-yellow-600 h-screen">
        {children}
      </div>
    </>
  )
}
Login.PageLayout = PageLayout

export default Login
