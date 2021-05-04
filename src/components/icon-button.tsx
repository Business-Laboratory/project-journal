import tw, { css } from 'twin.macro'
import { forwardRef } from 'react'

export { IconButton }
export type { IconButtonProps }

type IconButtonProps = React.ComponentPropsWithRef<'button'>

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ children, ...props }, ref) {
    return (
      <button ref={ref} css={iconButtonCss} {...props}>
        {children}
      </button>
    )
  }
)

const iconButtonCss = [
  tw`inline-flex space-x-2 items-center hover:text-copper-300
    focus:outline-none`,
  css`
    &.focus-visible {
      ${tw`ring-2 ring-copper-400`}
    }
  `,
]
