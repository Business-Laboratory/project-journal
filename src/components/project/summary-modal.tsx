import 'twin.macro'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { MarkdownTextArea, Modal, SaveButton } from '@components/modal'
import { Project } from '@queries/useProject'
import { useUpdateSummary } from '@queries/useUpdateSummary'

export { SummaryModal, createDescriptionPath, createRoadmapProject }

type SummaryModalProps = {
  projectId: number
  summary: Exclude<Project['summary'], null>
}

function SummaryModal({ projectId, summary }: SummaryModalProps) {
  const router = useRouter()
  const { edit } = router.query

  if (
    !edit ||
    Array.isArray(edit) ||
    (edit !== 'description' && edit !== 'roadmap')
  ) {
    return null
  }

  const handleOnDismiss = () => {
    router.replace(`/project/${projectId}`, undefined, { shallow: true })
  }

  return (
    <Modal isOpen onDismiss={handleOnDismiss}>
      <SummaryEditModalContent
        projectId={projectId}
        summary={summary}
        onDismiss={handleOnDismiss}
        edit={edit}
      />
    </Modal>
  )
}

type SummaryEditModalContentProps = SummaryModalProps & {
  onDismiss: () => void
  edit: 'roadmap' | 'description'
}
function SummaryEditModalContent({
  projectId,
  summary,
  onDismiss,
  edit,
}: SummaryEditModalContentProps) {
  const id = summary.id
  const [body, setBody] = useState(() => {
    const originalBody =
      edit === 'description' ? summary['description'] : summary['roadmap']
    return originalBody ?? ''
  })
  const summaryMutation = useUpdateSummary(projectId)

  const disabled = !body || summaryMutation.status === 'loading'

  return (
    <div tw="space-y-8 flex flex-col items-end">
      <div tw="bl-text-3xl">
        {edit === 'description' ? 'Project Description' : 'Project Roadmap'}
      </div>

      <MarkdownTextArea
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <SaveButton
        tw="float-right"
        onClick={() => {
          if (disabled) return
          summaryMutation.mutate(
            edit === 'description'
              ? { id, description: body }
              : { id, roadmap: body },
            { onSuccess: onDismiss }
          )
        }}
        disabled={disabled}
        error={summaryMutation.status === 'error'}
      >
        {summaryMutation.status === 'loading'
          ? `Saving ${edit}...`
          : `Save ${edit}`}
      </SaveButton>
    </div>
  )
}

function createDescriptionPath(projectId: number) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'description' },
  }
}

function createRoadmapProject(projectId: number) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'roadmap' },
  }
}
