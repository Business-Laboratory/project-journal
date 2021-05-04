import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useReducer, useState } from 'react'

import { Modal, SaveButton } from '@components/modal'
import { useUpdateSummary } from '@queries/useUpdateSummary'
import { Project } from '@queries/useProject'
import { User } from '@queries/useUser'

export { SettingsModal, createSettingsPath }

type SettingsModalProps = {
  projectId: number
  project: Project
}

function SettingsModal({ projectId, project }: SettingsModalProps) {
  const router = useRouter()
  const { edit } = router.query

  if (!edit || Array.isArray(edit) || edit !== 'settings') {
    return null
  }

  const handleOnDismiss = () => {
    router.replace(`/project/${projectId}`, undefined, { shallow: true })
  }

  return (
    <Modal isOpen onDismiss={handleOnDismiss}>
      <SettingsEditModalContent
        projectId={projectId}
        onDismiss={handleOnDismiss}
        edit={edit}
        project={project}
      />
    </Modal>
  )
}

type SettingsEditModalContentProps = SettingsModalProps & {
  onDismiss: () => void
  edit: 'settings'
  project: Project
}
function SettingsEditModalContent({
  projectId,
  onDismiss,
  edit,
  project,
}: SettingsEditModalContentProps) {
  const [{ name, imageUrl, clientId, team }, dispatch] = useReducer(
    settingsReducer,
    initialState(project)
  )
  // const summaryMutation = useUpdateSummary(projectId)

  // const disabled = !body || summaryMutation.status === 'loading'

  return (
    <div tw="space-y-8 flex flex-col items-end">
      <label tw="flex flex-col w-full">
        <span tw="bl-text-xs text-gray-yellow-300">Update title</span>
        <input
          css={[
            tw`w-full bl-text-3xl placeholder-gray-yellow-400`,
            tw`focus:outline-none border-b border-gray-yellow-600`,
          ]}
          type="text"
          value={name}
          onChange={(e) =>
            dispatch({ type: 'SET_NAME', payload: e.target.value })
          }
          placeholder="Update #"
        />
      </label>
    </div>
  )
}

const initialState = ({ name, imageUrl, client, team }: Project) => ({
  name: name ?? '',
  imageUrl: imageUrl ?? '',
  clientId: client?.id ?? null,
  team: team ?? [],
})

type ActionType =
  | { type: 'SET_NAME'; payload: String }
  | { type: 'SET_IMAGE'; payload: String }
  | { type: 'SET_CLIENT'; payload: number | null }
  | { type: 'SET_TEAM'; payload: User[] }

function settingsReducer(
  state: ReturnType<typeof initialState>,
  action: ActionType
) {
  switch (action.type) {
    case 'SET_NAME': {
      return { ...state, name: action.payload } as ReturnType<
        typeof initialState
      >
    }
    case 'SET_IMAGE': {
      return { ...state, imageUrl: action.payload } as ReturnType<
        typeof initialState
      >
    }
    case 'SET_CLIENT': {
      return { ...state, clientId: action.payload } as ReturnType<
        typeof initialState
      >
    }
    case 'SET_TEAM': {
      return { ...state, team: action.payload } as ReturnType<
        typeof initialState
      >
    }
  }
}

function createSettingsPath(projectId: number) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'settings' },
  }
}
