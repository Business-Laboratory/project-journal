import { AuthProvider } from '@components/auth-context'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import '../styles/globals.css'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  return (
    <>
      <GlobalStyles />
      <AuthProvider>
        {
          // get a page root if one was set
          Component.PageLayout ? (
            <Component.PageLayout>
              <Component {...pageProps} />
            </Component.PageLayout>
          ) : (
            <Component {...pageProps} />
          )
        }
      </AuthProvider>
    </>
  )
}

export default App
