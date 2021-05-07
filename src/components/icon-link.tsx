import tw, { css } from 'twin.macro'
import Link from 'next/link'

import type { LinkProps } from 'next/link'
import type { Url } from 'url'

export { IconLink }
export type { IconLinkProps }

type IconLinkProps = LinkProps & {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  as?: (string & Url) | undefined // not sure why, but LinkProps['as'] is not actually correct
}

function IconLink({
  className,
  children,
  href,
  onClick,
  ...props
}: IconLinkProps) {
  // Had to add role and key listener for eslint to stop yelling at me
  // Probably change "Add project" from IconLink to button to avoid this
  return (
    <Link href={href} passHref {...props}>
      <a
        role={!onClick ? 'link' : 'button'}
        onKeyDown={(e) => {}}
        css={iconLinkCss}
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    </Link>
  )
}

const iconLinkCss = [
  tw`inline-flex space-x-2 items-center hover:text-copper-300
    focus:outline-none`,
  css`
    &.focus-visible {
      ${tw`ring-2 ring-copper-400`}
    }
  `,
]
