import 'twin.macro'
import Header from 'next/head'
function Login() {
  return (
    <div tw="relative mx-auto space-y-16 max-w-max top-24">
      <header>
        <h1 tw="bl-text-5xl text-center">Log in</h1>
      </header>
      <main tw="flex flex-col space-y-8">
        <LoginProviderButton>Continue with Google</LoginProviderButton>
        <LoginProviderButton>Continue with Microsoft</LoginProviderButton>
      </main>
    </div>
  )
}

function LoginProviderButton(props: React.ComponentPropsWithoutRef<'button'>) {
  return (
    <button tw="py-4 px-12 border-2 border-copper-400 bl-text-lg" {...props} />
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
