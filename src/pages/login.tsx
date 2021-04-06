import tw from 'twin.macro'
import { useState } from 'react'
import Header from 'next/head'
import { signIn } from 'next-auth/client'

const callbackUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}/`
function Login() {
  return (
    <>
      <Header>
        <title>Login | Project Journal</title>
      </Header>
      <div tw="mx-auto space-y-16 max-w-max mt-10">
        <header>
          <h1 tw="bl-text-4xl text-center">Log in</h1>
        </header>
        <main tw="flex flex-col mt-9 space-y-8">
          <LoginProviderButton
            onClick={() => {
              signIn('google', { callbackUrl })
            }}
          >
            Continue with google
          </LoginProviderButton>
          <LoginProviderButton
            onClick={() => {
              signIn('azure-ad-b2c', { callbackUrl })
            }}
          >
            continue with microsoft
          </LoginProviderButton>
          <hr tw="w-full h-0 border-t-2 border-lichen-green-200" />
          <EmailLogin />
        </main>
      </div>
    </>
  )
}

export default Login

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
        {loginState === 'loggingIn' ? 'sending email...' : 'sign in with email'}
      </LoginProviderButton>
      {loginState === 'error' ? (
        <p tw="bl-text-sm text-matisse-red-200 max-w-fit" role="alert">
          Something went wrong, please try again. If the problem persists you
          can email help@business-laboratory.com
        </p>
      ) : null}
    </form>
  )
}

function LoginProviderButton({
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      css={[
        tw`py-2 px-8 border-2 border-copper-300 bl-text-lg uppercase hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)`,
        disabled
          ? tw`bg-gray-red-200 text-gray-yellow-500 hover:(ring-0) focus:(ring-0)`
          : null,
      ]}
      disabled={disabled}
      {...props}
    />
  )
}

// taken from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}
