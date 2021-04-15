import { css } from '@emotion/react'
import 'twin.macro'

export function Timeline() {
  return (
    <nav
      tw="relative w-20 bg-gray-yellow-600 border-r-2 border-gray-yellow-300 py-10"
      css={css`
        /* margin-top: -2.5rem; */
        height: 100%;
        /* height: calc(100% - 5rem); */
      `}
    >
      {/* <div tw="mt-10"> */}
      <Bar />
      {/* </div> */}
    </nav>
  )
}

function Bar() {
  return (
    <div
      tw="absolute left-0 right-0 mx-auto h-full bg-copper-300"
      css={css`
        width: 2px;
        height: calc(100% - 5rem);
      `}
    ></div>
  )
}

function DateDelineator() {
  return null
}

function UpdateCircle() {
  return null
}
