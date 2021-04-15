import tw, { css } from 'twin.macro'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { SearchBar } from './index'
import { PlusIcon, EditIcon } from 'icons'
import { Update } from '@prisma/client'
import { format } from 'date-fns'
import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'

type ProjectInformationProps = {
  projectId: number
  updates: Update[]
}
export function ProjectInformation({
  projectId,
  updates,
}: ProjectInformationProps) {
  const user = useAuth()
  return (
    <article
      css={[
        tw`h-full overflow-y-auto border-r-2 border-gray-yellow-300`,
        css`
          ::-webkit-scrollbar {
            display: none;
          }
          -ms-overflow-style: none;
          scrollbar-width: none;
        `,
      ]}
    >
      <div tw="w-9/12 mx-auto py-10 space-y-8">
        <SearchBar />
        {user?.role === 'ADMIN' && (
          <IconLink pathName={`/project/${projectId}/#`}>
            <PlusIcon tw="w-6 h-6" />
            <span tw="bl-text-2xl">Add update</span>
          </IconLink>
        )}
        <div tw="space-y-12">
          {updates.map(({ title, body, createdAt }, index) => (
            <div key={index} tw="space-y-6">
              <div tw="inline-flex items-center space-x-2">
                {user?.role === 'ADMIN' ? (
                  <IconLink pathName={`/project/${projectId}/#`}>
                    <EditIcon tw="cursor-pointer w-6 h-6" />
                    <span tw="bl-text-3xl">{title}</span>
                  </IconLink>
                ) : (
                  <span tw="bl-text-3xl">{title}</span>
                )}

                <span tw="bl-text-sm self-end pb-2">
                  {format(new Date(createdAt), 'M/d/yy')}
                </span>
              </div>
              <ReactMarkdown plugins={[gfm]}>{body}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
