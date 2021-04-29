import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useEffect, useReducer, useState } from 'react'

import { Modal } from '@components/modal'
import { Button } from '@components/button'
import { CloseIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { useDeleteUpdateMutation } from '@queries/useDeleteUpdateMutation'
import { useUpdateMutation } from '@queries/useUpdateMutation'

import type { Updates } from '@queries/useUpdates'

type Update = Updates[0]

type UpdateModalProps = {
  isOpen: boolean
  close: () => void
  projectId: number
  update:
    | Update
    | {
        id: 'new'
        title: string
        body: string
      }
}
export function UpdateModal({
  isOpen,
  close,
  projectId,
  update,
}: UpdateModalProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <UpdateModalContent projectId={projectId} update={update} close={close} />
    </Modal>
  )
}

type NewUpdate = {
  id: 'new'
  title: string
  body: string
}
type UpdateModalContentProps = {
  projectId: number
  update: Update | NewUpdate
  close: () => void
}
function UpdateModalContent({
  projectId,
  update,
  close,
  ...props
}: UpdateModalContentProps) {
  const router = useRouter()
  const [{ id, title, body }, dispatch] = useReducer(
    updateReducer,
    initialState(update)
  )
  const mutation = useUpdateMutation(projectId)

  //Any updateId that isn't found in our data defaults to path /project/projectId?updateId=new
  useEffect(() => {
    if (id === 'new' && router.query.updateId !== 'new') {
      router.replace(`/project/${projectId}?updateId=new`, undefined, {
        shallow: true,
      })
    }
  }, [id, router, projectId])

  async function save() {
    if (mutation.status === 'loading') {
      return
    }
    mutation.mutate({ id, title, body, projectId }, { onSuccess: close })
  }

  return (
    <div tw="space-y-16">
      <div tw="space-y-8 text-right">
        <div tw="text-left">
          {/* Icon Link put in here to remove top margin on top component */}
          <IconLink
            tw="absolute top-3 right-3"
            pathName={`/project/${projectId}`}
            replace={true}
          >
            <CloseIcon tw="w-4 h-4" />
          </IconLink>
          <div tw="bl-text-xs text-gray-yellow-300">Update title</div>
          <input
            css={[
              tw`w-full bl-text-3xl placeholder-gray-yellow-400`,
              tw`focus:outline-none border-b border-gray-yellow-600`,
            ]}
            type="text"
            value={title}
            onChange={(e) =>
              dispatch({ type: 'SET_TITLE', payload: e.target.value })
            }
            placeholder="Update #"
          />
        </div>
        <textarea
          // Padding bottom doesn't work.  Found this age old bug https://bugzilla.mozilla.org/show_bug.cgi?id=748518
          tw="w-full h-64 py-6 px-5 overflow-y-scroll resize-none focus:outline-none border border-gray-yellow-600"
          value={body}
          onChange={(e) =>
            dispatch({ type: 'SET_BODY', payload: e.target.value })
          }
        />
        <div tw="space-y-3">
          <Button
            variant="important"
            onClick={() => save()}
            disabled={mutation.status === 'loading'}
          >
            {mutation.status === 'loading' ? 'Saving update...' : 'Save update'}
          </Button>
          {mutation.status === 'error' ? (
            <div tw="bl-text-lg uppercase text-matisse-red-200">
              Failed to save
            </div>
          ) : null}
        </div>
      </div>
      {id !== 'new' ? (
        <DeleteSection
          projectId={projectId}
          updateId={id}
          title={title}
          close={close}
        />
      ) : null}
    </div>
  )
}

type SaveState = 'disabled' | 'enabled' | 'saving' | 'error'
const initialState = ({
  id = 'new',
  title = '',
  body = '',
}: {
  id: number | 'new'
  title: string
  body: string
}) => ({
  id,
  title,
  body,
  saveState: 'disabled' as SaveState,
})

type ActionType =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_BODY'; payload: string }
  | { type: 'SAVING' }
  | { type: 'FAILURE' }

function updateReducer(
  state: ReturnType<typeof initialState>,
  action: ActionType
) {
  switch (action.type) {
    case 'SET_TITLE': {
      if (state.saveState === 'saving') return state
      let saveState: SaveState = 'disabled'
      if (action.payload !== '' && state.body !== '') {
        saveState = 'enabled'
      }
      return { ...state, title: action.payload, saveState }
    }
    case 'SET_BODY': {
      if (state.saveState === 'saving') return state
      let saveState: SaveState = 'disabled'
      if (action.payload !== '' && state.title !== '') {
        saveState = 'enabled'
      }
      return { ...state, body: action.payload, saveState }
    }
    case 'SAVING': {
      if (state.saveState === 'enabled' || state.saveState === 'disabled') {
        const saveState: SaveState = 'saving'
        return { ...state, saveState }
      }
      return state
    }
    case 'FAILURE': {
      const saveState: SaveState = 'error'
      return { ...state, saveState }
    }
  }
}

type DeleteSectionProps = {
  projectId: number
  updateId: number
  title: string
  close: () => void
}
function DeleteSection({
  projectId,
  updateId,
  title,
  close,
}: DeleteSectionProps) {
  const [verifyTitle, setVerifyTitle] = useState('')
  const mutation = useDeleteUpdateMutation(projectId)

  const titleIsUnverified = verifyTitle !== title

  const handleDelete = () => {
    if (titleIsUnverified) {
      return
    }
    mutation.mutate(updateId, { onSuccess: close })
  }

  return (
    <div tw="space-y-12">
      <div tw="w-full border-b border-dashed border-matisse-red-200" />
      <div tw="w-full grid grid-cols-2 col-auto gap-x-4">
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
        <div tw="text-right col-span-1 pr-2 space-y-2">
          <Button
            disabled={titleIsUnverified || mutation.status === 'loading'}
            onClick={handleDelete}
          >
            {mutation.status === 'loading'
              ? 'Deleting update...'
              : 'Delete update'}
          </Button>
          {mutation.status === 'error' ? (
            <div tw="bl-text-lg text-matisse-red-200 uppercase">
              Failed to delete
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
