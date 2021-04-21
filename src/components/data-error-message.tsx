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
  //Ring color is copper-400
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
            tw`bl-text-2xl text-copper-300
              focus:outline-none`,
            css`
              &.focus-visible {
                --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                  var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
                  calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
                  var(--tw-shadow, 0 0 #0000);
                --tw-ring-opacity: 1;
                --tw-ring-color: rgba(171, 133, 94, var(--tw-ring-opacity));
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
