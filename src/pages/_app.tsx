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
  const [imageUrl, setImageUrl] = useState('')
  useEffect(() => {
    fetch('/api/blob')
      .then((res) => res.json())
      .then(({ image }) => {
        console.log(image)
        setImageUrl(image)
      })
  }, [])

  const [imageData, setImageData] = useState<null | {
    name: string
    data: string
  }>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      {/* this style is applied to avoid the "bounce" on iOS/macOS: https://stackoverflow.com/a/21247262/10128987 */}
      <div tw="absolute inset-0 overflow-auto bg-gray-yellow-100 text-gray-yellow-600">
        <AuthProvider>
          <AppBar />
          {imageUrl ? (
            <div
              tw="relative mt-4 ml-4"
              css={css`
                width: 170px;
                height: 210px;
              `}
            >
              <Image tw="object-cover" layout="fill" src={imageUrl} alt="" />
              {/* <img tw="object-cover" src={imageUrl} alt="" /> */}
            </div>
          ) : null}

          <form
            tw="flex flex-col w-80 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              console.log('right here', imageData)
              if (imageData === null) return
              fetch('/api/blob', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(imageData),
              })
                .then((res) => res.json())
                .then(({ message }) => console.log(message))
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
                    data: result,
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

function b64toBlob(byteCharacters: string, contentType = '', sliceSize = 512) {
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  const blob = new Blob(byteArrays, { type: contentType })
  console.log('creating the blob', blob)
  return blob
}
