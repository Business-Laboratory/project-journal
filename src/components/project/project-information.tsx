import tw, { css } from 'twin.macro'
import Select from 'react-select'
import React from 'react'
import Link from 'next/link'
import { PlusIcon, EditIcon } from 'icons'
import { Update } from '@prisma/client'
import { format } from 'date-fns'
import { useAuth } from '@components/auth-context'

type ProjectInformationProps = {
  updates: Update[]
}
export function ProjectInformation({ updates }: ProjectInformationProps) {
  const user = useAuth()
  return (
    <article
      css={[
        tw`h-full flex-grow overflow-y-auto py-10 border-r-2 border-gray-yellow-300`,
        css`
          ::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `,
      ]}
    >
      <div tw="w-8/12 mx-auto space-y-8">
        <Select />
        {user?.role === 'ADMIN' && (
          <Link href={'#'} passHref>
            <a tw="inline-flex space-x-2 items-center hover:text-copper-300">
              <PlusIcon tw="w-6 h-6" />
              <span tw="bl-text-2xl">Add update</span>
            </a>
          </Link>
        )}
        <div tw="space-y-12">
          {updates.map(({ title, body, createdAt }) => (
            <div tw="space-y-6">
              <div tw="inline-flex items-center space-x-2">
                {user?.role === 'ADMIN' && (
                  <EditIcon tw="cursor-pointer w-7 h-7" />
                )}
                <span tw="bl-text-3xl">{title}</span>
                <span tw="bl-text-sm">{format(createdAt, 'M/d/yy')}</span>
              </div>
              <div>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
