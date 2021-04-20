import tw, { css } from 'twin.macro'

export { DataErrorMessage }
export type { DataErrorMessageProps }

type DataErrorMessageProps = {
  errorMessage: string
}
function DataErrorMessage({ errorMessage }: DataErrorMessageProps) {
  //Ring color is copper-400
  return (
    <div tw="space-y-6 pt-40">
      <h1 tw="bl-text-3xl text-center text-matisse-red-200 uppercase">
        {errorMessage}
      </h1>
      <div tw="max-w-max mx-auto">
        <p tw="bl-text-2xl text-center">If the issue continues email</p>
        <a
          href="mailto:help@business-laboratory.com"
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
          help@business-laboratory.com
        </a>
      </div>
    </div>
  )
}
