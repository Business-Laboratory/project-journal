import 'twin.macro'
import { useState } from 'react'
import Header from 'next/head'
import { signIn } from 'next-auth/client'

import { Button } from '@components/button'
import { TextInput } from '@components/text-input'

const callbackUrl = `/`
function Login() {
  return (
    <>
      <Header>
        <title>Login | Project Journal</title>
      </Header>
      <main tw="py-10 mx-auto px-4 max-w-max">
        <div tw="flex flex-col space-y-9">
          <h1 tw="bl-text-4xl text-center">Log in</h1>
          <Button
            onClick={() => {
              signIn('google', { callbackUrl })
            }}
          >
            Continue with google
          </Button>
          <Button
            onClick={() => {
              signIn('azure-ad-b2c', { callbackUrl })
            }}
          >
            continue with microsoft
          </Button>
          <hr tw="w-full h-0 border-t border-gray-yellow-300 border-dashed" />
          <EmailLogin />
        </div>
      </main>
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
      <TextInput
        id="email-login"
        label="Email"
        type="email"
        placeholder="email@example.com"
        value={email}
        onChange={(value) => {
          setEmail(value)
          setLoginState(validateEmail(value) ? 'enabled' : 'disabled')
        }}
      />
      <p tw="bl-text-sm max-w-max">
        You will be sent a link to a password-free sign in
      </p>
      <Button
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
        {loginState === 'loggingIn'
          ? 'sending email...'
          : 'continue with email'}
      </Button>
      {loginState === 'error' ? (
        <p tw="bl-text-sm text-matisse-red-200 max-w-fit" role="alert">
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
