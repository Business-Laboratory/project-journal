import tw, { css } from 'twin.macro'
import Link from 'next/link'

import type { LinkProps } from 'next/link'
import type { Url } from 'url'

export { IconLink }
export type { IconLinkProps }

type IconLinkProps = LinkProps & {
  children: React.ReactNode
  className?: string
  as?: (string & Url) | undefined // not sure why, but LinkProps['as'] is not actually correct
}

function IconLink({ className, children, href, ...props }: IconLinkProps) {
  return (
    <Link href={href} passHref {...props}>
      <a css={iconLinkCss} className={className}>
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
