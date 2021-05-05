import tw, { css } from 'twin.macro'

export { DataErrorMessage }
export type { DataErrorMessageProps }

type DataErrorMessageProps = {
  errorMessage: string
  email?: string
}
function DataErrorMessage({
  errorMessage,
  email = 'help@business-laboratory.com',
}: DataErrorMessageProps) {
  return (
    <div tw="space-y-6">
      <h1 tw="bl-text-3xl text-center text-matisse-red-200 uppercase">
        {errorMessage}
      </h1>
      <div tw="max-w-max mx-auto text-center">
        <p tw="bl-text-2xl">If the issue continues email</p>
        <a
          href={`mailto:${email}`}
          css={[
            tw`bl-text-2xl text-copper-300 focus:outline-none`,
            css`
              &.focus-visible {
                ${tw`ring-2 ring-copper-400`}
              }
            `,
          ]}
        >
          {email}
        </a>
      </div>
    </div>
  )
}
