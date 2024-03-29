import 'twin.macro'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  DeleteSection,
  MarkdownTextArea,
  Modal,
  SaveButton,
} from '@components/modal'
import { TextInput } from '@components/text-input'
import { useUpdateMutation } from '@queries/useUpdateMutation'
import { useDeleteUpdateMutation } from '@queries/useDeleteUpdateMutation'

import type { UpdateBody } from '@queries/useUpdateMutation'
import type { Updates } from '@queries/useUpdates'
import type { ProjectId } from 'pages/api/project'

export { UpdateModal, createEditUpdateHref }

type UpdateModalProps = {
  projectId: ProjectId
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
  projectId: ProjectId
  data?: Omit<UpdateBody, 'projectId'>
  onDismiss: () => void
}
function ProjectEditModalContent({
  projectId,
  data = { id: 'new', title: '', body: '' },
  onDismiss,
}: ProjectEditModalContentProps) {
  const router = useRouter()
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
        <TextInput
          tw="bl-text-3xl w-full"
          label="Update title"
          placeholder="Update #"
          value={title}
          onChange={(value) => setTitle(value)}
        />

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
              {
                onSuccess: (update) => {
                  if (projectId === 'new') {
                    router.replace(`./${update.projectId}`)
                  } else {
                    onDismiss()
                  }
                },
              }
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
      {
        // cannot delete new updates or updates that belong to new projects which haven't been uploaded yet
        id !== 'new' && projectId !== 'new' ? (
          <DeleteSection
            tw="mt-16"
            label="Verify update title"
            verificationText={title}
            buttonText={
              deleteMutation.status === 'loading'
                ? 'Deleting...'
                : 'Delete update'
            }
            onDelete={() => {
              deleteMutation.mutate(id, {
                onSuccess: () => {
                  onDismiss()
                },
              })
            }}
            status={deleteMutation.status}
          />
        ) : null
      }
    </>
  )
}

/**
 * Any update id that isn't found in our data defaults to path /project/projectId?edit=update&updateId=new
 */
function useRedirectNewUpdate(projectId: ProjectId, id: UpdateBody['id']) {
  const router = useRouter()
  const { updateId } = router.query

  useEffect(() => {
    if (id === 'new' && updateId !== 'new') {
      router.replace(createEditUpdateHref(projectId, 'new'), undefined, {
        shallow: true,
      })
    }
  }, [id, projectId, router, updateId])
}

function createEditUpdateHref(
  projectId: ProjectId,
  updateId: UpdateBody['id']
) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'update', updateId: String(updateId) },
  }
}
