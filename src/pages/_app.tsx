import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'
import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthProvider } from '@components/auth-context'
import AppBar from '@components/AppBar'

import '../styles/globals.css'
import Image from 'next/image'
import { css } from '@emotion/react'
import { Button } from '@components/button'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  const [imageData, setImageData] = useState<null | {
    name: string
    contentType: string
    dataUrl: string
  }>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      {/* this style is applied to avoid the "bounce" on iOS/macOS: https://stackoverflow.com/a/21247262/10128987 */}
      <div tw="absolute inset-0 overflow-auto bg-gray-yellow-100 text-gray-yellow-600">
        <AuthProvider>
          <AppBar />
          <form
            tw="flex flex-col w-80 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (imageData === null) return
              fetch('/api/blob', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imageData),
              })
                .then((res) => res.json())
                .then((data) => console.log(data))
            }}
          >
            <label htmlFor="img">Select image:</label>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                if (!file) {
                  throw new Error('no file!')
                }
                const reader = new FileReader()
                if (file) {
                  reader.readAsDataURL(file)
                }

                reader.addEventListener('load', function () {
                  let { result } = reader
                  if (result instanceof ArrayBuffer) {
                    result = URL.createObjectURL(reader.result)
                  }
                  if (!result) return
                  setImageData({
                    name: file.name,
                    contentType: file.type,
                    dataUrl: result,
                  })
                })
              }}
            />
            <Button type="submit" disabled={imageData === null}>
              Upload the image
            </Button>
          </form>

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
