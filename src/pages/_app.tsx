import React from 'react'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthProvider } from '@components/auth-context'
import AppBar from '@components/AppBar'

import '../styles/globals.css'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      {/* this style is applied to avoid the "bounce" on iOS/macOS: https://stackoverflow.com/a/21247262/10128987 */}
      <div tw="absolute inset-0 overflow-auto bg-gray-yellow-100">
        <AuthProvider>
          <AppBar />
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
      </div>
    </QueryClientProvider>
  )
}

export default App
