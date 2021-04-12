import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthProvider } from '@components/auth-context'
import AppBar from '@components/AppBar'

import '../styles/globals.css'
import Image from 'next/image'
import { css } from '@emotion/react'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  // const [imageUrl, setImageUrl] = useState('')
  // useEffect(() => {
  //   fetch('/api/blob')
  //     .then((res) => res.json())
  //     .then(({ image }) => {
  //       console.log(image)
  //       setImageUrl(image)
  //     })
  // }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      {/* this style is applied to avoid the "bounce" on iOS/macOS: https://stackoverflow.com/a/21247262/10128987 */}
      <div tw="absolute inset-0 overflow-auto bg-gray-yellow-100 text-gray-yellow-600">
        <AuthProvider>
          <AppBar />
          {/* {imageUrl ? (
            <div
              tw="relative mt-4 ml-4"
              css={css`
                width: 170px;
                height: 210px;
              `}
            >
              <Image tw="object-cover" layout="fill" src={imageUrl} alt="" />
            </div>
          ) : null} */}

          <div
            tw="relative mt-4 ml-4"
            css={css`
              width: 170px;
              height: 210px;
            `}
          >
            <Image
              tw="object-cover"
              layout="fill"
              src="https://projectjournalassets.blob.core.windows.net/test/calumet_optimizer.png?sv=2020-06-12&se=2021-04-12T21%3A40%3A45Z&sr=b&sp=r&sig=gU62IhYL9Dvqq1mEbBG0jmQT1qNCJwCXe%2FCXJhA3uqA%3D&rscc=public%2C%20max-age%3D300%2C%20immutable"
              alt=""
            />
          </div>

          <main tw="pt-10">
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
          </main>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  )
}

export default App
