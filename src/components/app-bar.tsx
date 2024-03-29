import tw, { css, theme } from 'twin.macro'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button'
import { forwardRef } from 'react'

import { useAuth } from '@components/auth-context'
import { LogoIcon } from 'icons'

import type { Role } from '@prisma/client'

import '@reach/menu-button/styles.css'

const appBarHeight = theme('spacing.12')

export { AppBar, appBarHeight }

function AppBar() {
  const user = useAuth()

  return (
    <header
      tw="sticky w-screen px-4 flex flex-row items-center justify-between bg-gray-yellow-500 top-0"
      css={css`
        height: ${appBarHeight};
      `}
    >
      <nav tw="inline-flex">
        <NavHome>Project Journal</NavHome>
        {user?.role === 'ADMIN' ? <AdminNavLinks /> : null}
      </nav>
      {user ? <UserMenu imageUrl={user.image} role={user.role} /> : null}
    </header>
  )
}

function AdminNavLinks() {
  const { pathname } = useRouter()

  return pathname === '/projects' || pathname === '/clients' ? (
    <div tw="ml-12 space-x-4">
      <NavLink pathName={pathname} href={'/projects'}>
        Projects
      </NavLink>
      <NavLink pathName={pathname} href={'/clients'}>
        Clients
      </NavLink>
    </div>
  ) : null
}

type NavLinkProps = {
  pathName: string
  href: string
  children: React.ReactNode
}
function NavLink({ pathName, href, children }: NavLinkProps) {
  return (
    <Link href={href} passHref>
      <a
        css={[
          tw`bl-text-3xl focus:outline-none`,
          pathName === href
            ? tw`text-gray-yellow-100 hover:underline`
            : tw`text-gray-yellow-300 hover:underline`,
          appbarElementRingCss,
        ]}
      >
        {children}
      </a>
    </Link>
  )
}

type MenuProps = {
  imageUrl: string | null
  role: Role | null
}

function UserMenu({ imageUrl, role }: MenuProps) {
  const router = useRouter()
  return (
    <Menu>
      <MenuButton tw="focus:outline-none focus:ring-2 focus:ring-copper-100 ">
        <div tw="w-6 h-6 rounded-full overflow-hidden hover:ring-2 hover:ring-copper-300">
          {imageUrl ? <img src={imageUrl} alt="" /> : <LogoIcon />}
        </div>
      </MenuButton>
      <MenuList
        css={[
          tw`flex flex-col items-center py-1 mt-4 border border-solid rounded text-gray-yellow-200 bg-gray-yellow-600 border-copper-300 focus:outline-none`,
          css`
            [data-reach-menu-item][data-selected] {
              background-color: ${theme('colors[gray-yellow].200')};
              color: ${theme('colors[gray-yellow].600')};
            }
          `,
        ]}
      >
        {role === 'ADMIN' && (
          <MenuItem css={menuItemTw} onSelect={() => router.push('/admins')}>
            <CustomMenuLink href="/admins">EDIT ADMINS</CustomMenuLink>
          </MenuItem>
        )}

        <MenuItem
          css={menuItemTw}
          onSelect={() => {
            signOut({
              callbackUrl: `/login`,
            })
          }}
        >
          Log out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

type NavHomeProps = {
  children: React.ReactNode
}
function NavHome({ children }: NavHomeProps) {
  return (
    <Link href="/" passHref>
      <a
        css={[
          tw`font-bold bl-text-3xl text-gray-yellow-100 hover:text-copper-300 focus:outline-none`,
          appbarElementRingCss,
        ]}
      >
        {children}
      </a>
    </Link>
  )
}

type CustomMenuLinkProps = React.ComponentPropsWithRef<'a'> & {
  href: LinkProps['href']
}
const CustomMenuLink = forwardRef<HTMLAnchorElement, CustomMenuLinkProps>(
  function CustomMenuLink({ href, children, ...props }, ref) {
    return (
      <Link href={href} passHref>
        <a ref={ref} {...props}>
          {children}
        </a>
      </Link>
    )
  }
)

const menuItemTw = tw`flex w-full px-3 py-1 bl-text-xs uppercase cursor-pointer text-gray-yellow-200 hover:bg-gray-yellow-200 hover:text-gray-yellow-600 focus:bg-gray-yellow-200 focus:text-gray-yellow-600`

const appbarElementRingCss = css`
  &.focus-visible {
    ${tw`ring-2 ring-copper-100`}
  }
`
