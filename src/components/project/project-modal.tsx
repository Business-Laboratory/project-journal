import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useEffect, useReducer } from 'react'

import { DeleteSection, Modal } from '@components/modal'
import { Button } from '@components/button'
import { CloseIcon } from 'icons'
import { IconLink } from '@components/icon-link'
import { useUpdateMutation } from '@queries/useUpdateMutation'
import { useDeleteUpdateMutation } from '@queries/useDeleteUpdateMutation'

import type { Updates } from '@queries/useUpdates'

type NewUpdate = {
  id: 'new'
  title: string
  body: string
}
type DescRoadmapEdit = {
  id: number
  title: string
  body: string
}
type ProjectModalProps = {
  isOpen: boolean
  close: () => void
  projectId: number
  data: Updates[0] | NewUpdate | DescRoadmapEdit
}
export function ProjectModal({
  isOpen,
  close,
  projectId,
  data,
}: ProjectModalProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <ProjectEditModalContent
        projectId={projectId}
        data={data}
        close={close}
      />
    </Modal>
  )
}

type ProjectEditModalContentProps = {
  projectId: number
  data: Updates[0] | NewUpdate | DescRoadmapEdit
  close: () => void
}
function ProjectEditModalContent({
  projectId,
  data,
  close,
}: ProjectEditModalContentProps) {
  const router = useRouter()
  const { edit, updateId } = router.query
  const [{ id, title, body }, dispatch] = useReducer(
    updateReducer,
    initialState(data)
  )
  const mutation = useUpdateMutation(projectId)

  //Any updateId that isn't found in our data defaults to path /project/projectId?edit=update&updateId=new
  useEffect(() => {
    if (id === 'new' && updateId !== 'new' && edit === 'edit') {
      router.replace(
        {
          pathname: `/project/${projectId}`,
          query: { edit: 'update', updateId: 'new' },
        },
        undefined,
        {
          shallow: true,
        }
      )
    }
  }, [id, router, edit, updateId, projectId])

  async function save() {
    dispatch({ type: 'SAVING' })
    try {
      if (edit === 'update') {
        mutation.mutate({ id, title, body, projectId }, { onSuccess: close })
      }
      if (
        (edit === 'description' || edit === 'roadmap') &&
        typeof id === 'number'
      ) {
        await postSummaryEdit({ id, edit, body })
      }
    } catch {
      dispatch({ type: 'FAILURE' })
    }
  }

  const deleteMutation = useDeleteUpdateMutation(projectId)

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
          {edit === 'update' ? (
            <>
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
            </>
          ) : (
            <div tw="bl-text-3xl">{title}</div>
          )}
        </div>
        <textarea
          // Padding bottom doesn't work. Found this age old bug https://bugzilla.mozilla.org/show_bug.cgi?id=748518
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
            disabled={!title || !body || mutation.status === 'loading'}
          >
            {mutation.status === 'loading' ? 'Saving...' : `Save ${edit}`}
          </Button>
          {mutation.status === 'error' ? (
            <div tw="bl-text-lg uppercase text-matisse-red-200">
              Failed to save
            </div>
          ) : null}
        </div>
      </div>
      {id !== 'new' && edit === 'update' ? (
        <DeleteSection
          verificationText={title}
          onDelete={() => {
            deleteMutation.mutate(id, {
              onSuccess: close,
            })
          }}
          status={deleteMutation.status}
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

type PostSummaryEditProps = {
  id: number
  edit: 'description' | 'roadmap'
  body: string
}
async function postSummaryEdit({ id, edit, body }: PostSummaryEditProps) {
  const res = await fetch(`/api/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, edit, body }),
  })
  if (!res.ok) {
    const response = await res.json()
    throw new Error(response.error)
  }
}
