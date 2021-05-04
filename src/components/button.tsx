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

const enabledCss = [
  tw`hover:bg-copper-400 hover:text-gray-yellow-100 focus:outline-none`,
  css`
    &.focus-visible {
      ${tw`ring-2 ring-copper-400`}
    }
  `,
]
