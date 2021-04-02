import tw, { css } from 'twin.macro'
import Link from 'next/link'
import { Dispatch, SetStateAction, useState } from 'react'
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button'
import { LogoIcon } from 'icons'
import { useRouter } from 'next/dist/client/router'

export default function Appbar() {
  const { pathname } = useRouter()
  console.log(pathname)
  // Will pull auth and projects/clients from context once implemented
  const [auth, setAuth] = useState<'admin' | 'user'>('admin')

  return (
    <Header>
      <div tw="inline-flex items-center">
        <Link href="/" passHref>
          <a tw="ml-4 text-3xl font-bold font-display text-gray-yellow-100">
            Project Journal
          </a>
        </Link>
        {auth === 'admin' ? (
          <div tw="ml-8">
            <Link href="/projects" passHref>
              <a
                css={[
                  tw`ml-4 text-3xl`,
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
                  tw`ml-4 text-3xl`,
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
      tw="w-full h-12 flex flex-row items-center justify-between bg-gray-yellow-500"
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
  const menuItemTw = tw`flex py-1 px-3 w-full text-gray-yellow-200 text-xs cursor-pointer hover:bg-gray-yellow-200 hover:text-gray-yellow-600`

  return (
    <Menu>
      <MenuButton tw="mr-4">
        <LogoIcon />
      </MenuButton>
      <MenuList
        tw="
        mt-4 flex flex-col items-center bg-gray-yellow-600 
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
