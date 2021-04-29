import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import {
  DeleteSection,
  MarkdownTextArea,
  Modal,
  SaveButton,
} from '@components/modal'
import { useUpdateMutation } from '@queries/useUpdateMutation'
import { useDeleteUpdateMutation } from '@queries/useDeleteUpdateMutation'

import type { UpdateBody } from '@queries/useUpdateMutation'
import type { Updates } from '@queries/useUpdates'

export { UpdateModal, createUpdatePath }

type UpdateModalProps = {
  projectId: number
  // TODO: Update the schema, because no update should be without a project id
  updates: Updates
}
function UpdateModal({ projectId, updates }: UpdateModalProps) {
  const router = useRouter()
  const { edit, updateId } = router.query

  if (!updateId || Array.isArray(updateId)) {
    return null
  }
  if (!edit || Array.isArray(edit)) {
    return null
  }

  const handleOnDismiss = () => {
    router.replace(`/project/${projectId}`, undefined, { shallow: true })
  }

  return (
    <Modal
      isOpen={edit === 'update' && Boolean(updateId)}
      onDismiss={handleOnDismiss}
    >
      <ProjectEditModalContent
        projectId={projectId}
        data={updates.find(({ id }) => id === Number(updateId))}
        onDismiss={handleOnDismiss}
      />
    </Modal>
  )
}

type ProjectEditModalContentProps = {
  projectId: number
  data?: Omit<UpdateBody, 'projectId'>
  onDismiss: () => void
}
function ProjectEditModalContent({
  projectId,
  data = { id: 'new', title: '', body: '' },
  onDismiss,
}: ProjectEditModalContentProps) {
  const { id, title: originalTitle, body: originalBody } = data
  const [title, setTitle] = useState(originalTitle)
  const [body, setBody] = useState(originalBody)
  useRedirectNewUpdate(projectId, id)
  const updateMutation = useUpdateMutation(projectId)
  const deleteMutation = useDeleteUpdateMutation(projectId)

  const disabled = !title || !body || updateMutation.status === 'loading'

  return (
    <>
      <div tw="space-y-8 flex flex-col items-end">
        <label tw="flex flex-col w-full">
          <span tw="bl-text-xs text-gray-yellow-300">Update title</span>
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
        </label>

        <MarkdownTextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <SaveButton
          tw="float-right"
          onClick={() => {
            if (disabled) return
            updateMutation.mutate(
              { id, title, body, projectId },
              { onSuccess: onDismiss }
            )
          }}
          disabled={disabled}
          error={updateMutation.status === 'error'}
        >
          {updateMutation.status === 'loading'
            ? 'Saving update...'
            : 'Save update'}
        </SaveButton>
      </div>
      {id !== 'new' ? (
        <DeleteSection
          tw="mt-16"
          verificationText={title}
          onDelete={() => {
            deleteMutation.mutate(id, {
              onSuccess: onDismiss,
            })
          }}
          status={deleteMutation.status}
        />
      ) : null}
    </>
  )
}

/**
 * any updateId that isn't found in our data defaults to path /project/projectId?edit=update&updateId=new
 */
function useRedirectNewUpdate(projectId: number, id: UpdateBody['id']) {
  const router = useRouter()
  const { updateId } = router.query

  useEffect(() => {
    if (id === 'new' && updateId !== 'new') {
      router.replace(createUpdatePath(projectId, 'new'), undefined, {
        shallow: true,
      })
    }
  }, [id, projectId, router, updateId])
}

function createUpdatePath(projectId: number, updateId: UpdateBody['id']) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'update', updateId: String(updateId) },
  }
}
