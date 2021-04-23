import tw, { css } from 'twin.macro'
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

import { SearchBar } from './index'
import { PlusIcon, EditIcon } from 'icons'
import { Update } from '@prisma/client'
import { format } from 'date-fns'
import { useAuth } from '@components/auth-context'
import { IconLink } from '@components/icon-link'
import { useRouter } from 'next/router'
import { Modal } from '@components/modal'

type ProjectInformationProps = {
  projectId: number
  updates: Update[]
}
export function ProjectInformation({
  projectId,
  updates,
}: ProjectInformationProps) {
  const user = useAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { update } = router.query

  useEffect(() => {
    if (!update || Array.isArray(update)) return
    const updateInformation = updates.find(({ id }) => id === Number(update))
    if (!updateInformation) {
      throw new Error(`Update doesn't exist`)
    }
    setOpen(true)
  }, [update, updates])

  const close = () => {
    setOpen(false)
    router.replace(`/project/${projectId}`, undefined, { shallow: true })
  }

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
          {updates.map(({ id, title, body, createdAt }, index) => (
            <div key={index} tw="space-y-6">
              <div tw="inline-flex items-center space-x-2">
                {user?.role === 'ADMIN' ? (
                  <IconLink pathName={`/project/${projectId}?update=${id}`}>
                    <EditIcon tw="w-6 h-6" />
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
      {!update || !Array.isArray(update) ? (
        <Modal isOpen={open} onDismiss={close}>
          <UpdateModalContent
            update={updates.find(({ id }) => id === Number(update))}
            close={close}
          />
        </Modal>
      ) : null}
    </article>
  )
}

type UpdateModalContentProps = {
  update: Update | undefined
  close: () => void
}
function UpdateModalContent({
  update,
  close,
  ...props
}: UpdateModalContentProps) {
  const [title, setTitle] = useState(update?.title ?? '')
  const [body, setBody] = useState(update?.body ?? '')
  const [verifyTitle, setVerifyTitle] = useState('')
  return (
    <div tw="space-y-8 text-right">
      <div tw="text-left">
        <div tw="bl-text-xs text-gray-yellow-300">Update title</div>
        <input
          css={[
            tw`w-full bl-text-3xl placeholder-gray-yellow-400`,
            tw`focus:outline-none border-b border-gray-yellow-600`,
          ]}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Update #"
        />
      </div>
      <textarea
        tw="w-full h-64 overflow-y-auto resize-none focus:outline-none border border-gray-yellow-600"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button tw="bl-text-lg uppercase px-4 py-1 border-4 border-copper-300">
        Save update
      </button>
      <div tw="w-full border-b border-dashed border-matisse-red-200" />
      <div tw="w-full grid grid-cols-2 col-auto">
        <div tw="text-left col-span-1">
          <div tw="bl-text-xs text-gray-yellow-300">Verify update title</div>
          <input
            tw="w-full placeholder-gray-yellow-400 border-b border-gray-yellow-600 focus:outline-none"
            type="text"
            value={verifyTitle}
            onChange={(e) => setVerifyTitle(e.target.value)}
            placeholder="Update #"
          />
        </div>
        <div tw="text-right col-span-1 pr-2">
          <button
            css={[
              tw`bl-text-lg uppercase py-1 px-2 border-2 border-copper-300`,
              tw`disabled:bg-gray-yellow-300 disabled:bg-opacity-60`,
            ]}
            disabled={title !== verifyTitle}
          >
            Delete update
          </button>
        </div>
      </div>
    </div>
  )
}
