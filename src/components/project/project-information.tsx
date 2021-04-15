import tw, { css } from 'twin.macro'

export function ProjectInformation() {
  return (
    <article
      css={[
        tw`flex-grow h-full overflow-y-auto border-r-2 border-gray-yellow-300`,
        css`
          ::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `,
      ]}
    ></article>
  )
}
