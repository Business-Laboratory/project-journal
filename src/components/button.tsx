import tw, { css } from 'twin.macro'
import React, { forwardRef, useMemo } from 'react'

export { Button }
export type { ButtonProps }

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  // Add more to this when we get more variants (danger, ect.)
  variant?: 'default' | 'important' | 'danger'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { disabled, variant = 'default', ...props },
  ref
) {
  const buttonCss = useButtonCss(variant, disabled)
  if (variant === 'important') {
    console.log(buttonCss)
  }
  return <button ref={ref} css={buttonCss} disabled={disabled} {...props} />
})

function useButtonCss(
  variant: ButtonProps['variant'],
  disabled: ButtonProps['disabled']
) {
  return useMemo(
    () => [
      baseCss,
      variant === 'important'
        ? importantCss
        : variant === 'danger'
        ? dangerCss
        : null,
      disabled ? disabledCss : enabledCss,
    ],
    [disabled, variant]
  )
}

const baseCss = tw`px-2 py-1 uppercase border-copper-300 bl-text-lg text-gray-yellow-600 border-2`
const importantCss = tw`border-4`
const dangerCss = tw`text-matisse-red-200`
const disabledCss = tw`cursor-not-allowed bg-gray-yellow-300 bg-opacity-60 text-gray-yellow-600 text-opacity-60`
// ring color is copper-400
const enabledCss = [
  tw`hover:bg-copper-400 hover:text-gray-yellow-100 focus:outline-none`,
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
]
