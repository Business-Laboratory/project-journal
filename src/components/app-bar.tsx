import tw, { css, theme } from 'twin.macro'
import Link from 'next/link'
import { signOut } from 'next-auth/client'
import { useRouter } from 'next/router'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuLink,
} from '@reach/menu-button'

import { useAuth } from '@components/auth-context'
import { LogoIcon } from 'icons'

import '@reach/menu-button/styles.css'

const appBarHeight = theme('spacing.12')

export { AppBar, appBarHeight }

function AppBar() {
  const { pathname } = useRouter()
  // Will pull auth and projects/clients from context once implemented
  const user = useAuth()

  return (
    <header
      tw="sticky w-screen px-4 flex flex-row items-center justify-between bg-gray-yellow-500 top-0 z-10"
      css={css`
        height: ${appBarHeight};
      `}
    >
      <nav tw="inline-flex">
        <NavHome>Project Journal</NavHome>
        {user?.role === 'ADMIN' &&
        (pathname === '/projects' || pathname === '/clients') ? (
          <div tw="ml-12 space-x-4">
            <NavLink pathName={pathname} href={'/projects'}>
              Projects
            </NavLink>
            <NavLink pathName={pathname} href={'/clients'}>
              Clients
            </NavLink>
          </div>
        ) : null}
      </nav>
      {user ? <UserMenu imageUrl={user.image ?? undefined} /> : null}
    </header>
  )
}

type MenuProps = {
  imageUrl?: string
}
function UserMenu({ imageUrl }: MenuProps) {
  const user = useAuth()
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
        {user?.role === 'ADMIN' && (
          <Link href="/edit-admins" passHref>
            <MenuLink css={menuItemTw} as="a">
              EDIT ADMINS
            </MenuLink>
          </Link>
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
  //Ring color is copper-100
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

type NavLinkProps = {
  pathName: string
  href: string
  children: React.ReactNode
}
function NavLink({ pathName, href, children }: NavLinkProps) {
  //Ring color is copper-100
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

const menuItemTw = tw`flex w-full px-3 py-1 text-xs uppercase cursor-pointer text-gray-yellow-200 hover:bg-gray-yellow-200 hover:text-gray-yellow-600 focus:bg-gray-yellow-200 focus:text-gray-yellow-600`

const appbarElementRingCss = css`
  &.focus-visible {
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
      var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
      calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
      var(--tw-shadow, 0 0 #0000);
    --tw-ring-opacity: 1;
    --tw-ring-color: rgba(251, 215, 183, var(--tw-ring-opacity));
  }
`