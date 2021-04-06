import tw from 'twin.macro'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { LogoIcon } from 'icons'
import { useRouter } from 'next/dist/client/router'

export default function Appbar() {
  const { pathname } = useRouter()
  // Will pull auth and projects/clients from context once implemented
  const [auth, setAuth] = useState<'admin' | 'user'>('admin')

  return (
    <Header>
      <div tw="inline-flex">
        <Link href="/" passHref>
          <a tw="bl-text-3xl font-bold text-gray-yellow-100">Project Journal</a>
        </Link>
        {auth === 'admin' &&
        (pathname === '/projects' || pathname === '/clients') ? (
          <div tw="ml-12 space-x-4">
            <Link href="/projects" passHref>
              <a
                css={[
                  tw`bl-text-3xl`,
                  pathname === '/projects'
                    ? tw`underline text-gray-yellow-100`
                    : tw`text-gray-yellow-300`,
                ]}
              >
                Projects
              </a>
            </Link>
            <Link href="/clients" passHref>
              <a
                css={[
                  tw`bl-text-3xl`,
                  pathname === '/clients'
                    ? tw`underline text-gray-yellow-100`
                    : tw`text-gray-yellow-300`,
                ]}
              >
                Clients
              </a>
            </Link>
          </div>
        ) : null}
      </div>
      <UserMenu
        // delete these once auth is implemented
        auth={auth}
        setAuth={setAuth}
      />
    </Header>
  )
}

type HeaderProps = {
  className?: string
  children?: React.ReactNode
}
function Header({ className, children }: HeaderProps) {
  return (
    <header
      tw="w-screen h-12 px-4 flex flex-row items-center justify-between bg-gray-yellow-500 top-0 sticky"
      className={className}
    >
      {children}
    </header>
  )
}

type MenuProps = {
  auth: 'admin' | 'user'
  setAuth: Dispatch<SetStateAction<'admin' | 'user'>>
}
function UserMenu({ auth, setAuth }: MenuProps) {
  const menuItemTw = tw`flex w-full px-3 py-1 text-xs cursor-pointer text-gray-yellow-200 hover:bg-gray-yellow-200 hover:text-gray-yellow-600`

  return (
    <Menu>
      <MenuButton>
        <LogoIcon />
      </MenuButton>
      <MenuList
        tw="
        mt-4 py-1 flex flex-col items-center bg-gray-yellow-600
        border-solid border border-copper-300
        rounded
      "
      >
        <MenuItem css={menuItemTw} onSelect={() => setAuth('user')}>
          User
        </MenuItem>
        <MenuItem css={menuItemTw} onSelect={() => setAuth('admin')}>
          Admin
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
