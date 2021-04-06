import tw from 'twin.macro'
import { useState } from 'react'
import Header from 'next/head'
import { signIn } from 'next-auth/client'

const callbackUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}/`
function Login() {
  return (
    <div tw="relative mx-auto space-y-16 max-w-max top-24">
      <header>
        <h1 tw="bl-text-5xl text-center">Log in</h1>
      </header>
      <main tw="flex flex-col space-y-8">
        <LoginProviderButton
          onClick={() => {
            signIn('google', { callbackUrl })
          }}
        >
          Continue with Google
        </LoginProviderButton>
        <LoginProviderButton>Continue with Microsoft</LoginProviderButton>
        <hr tw="w-full h-0 border-t-2 border-lichen-green-200" />
        <EmailLogin />
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

function EmailLogin() {
  const [email, setEmail] = useState('')
  const [loginState, setLoginState] = useState<
    'disabled' | 'enabled' | 'loggingIn' | 'error'
  >('disabled')

  const disabled = loginState === 'disabled' || loginState === 'loggingIn'
  return (
    <form tw="flex flex-col space-y-2">
      <label htmlFor="email-login" tw="bl-text-sm">
        Email
      </label>
      <input
        id="email-login"
        tw="h-12 px-2 border-2 border-copper-400 bl-text-base hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)"
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          const value = e.currentTarget.value
          setEmail(value)
          setLoginState(validateEmail(value) ? 'enabled' : 'disabled')
        }}
      />
      <p tw="text-xs max-w-fit">
        You will be sent a link to a password-free sign in.
      </p>
      <LoginProviderButton
        css={[
          disabled
            ? tw`bg-gray-red-200 text-gray-yellow-500 hover:(ring-0) focus:(ring-0)`
            : null,
        ]}
        disabled={disabled}
        onClick={async (e) => {
          e.preventDefault()
          if (!email) return
          setLoginState('loggingIn')
          try {
            await signIn('email', { email, callbackUrl })
          } catch (error) {
            // when it fails, we want to warn the user
            console.error(error)
            setLoginState('error')
          }
        }}
        type="submit"
      >
        {loginState === 'loggingIn' ? 'Sending email...' : 'Sign in with Email'}
      </LoginProviderButton>
      {loginState === 'error' ? (
        <p tw="bl-text-sm text-matisse-red-300 max-w-fit" role="alert">
          Something went wrong, please try again. If the problem persists you
          can email help@business-laboratory.com
        </p>
      ) : null}
    </form>
  )
}

// taken from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
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
