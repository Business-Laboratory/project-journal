import tw from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useReducer } from 'react'

import { DeleteSection, Modal, SaveButton } from '@components/modal'
import { Project } from '@queries/useProject'
import { User } from '@queries/useUser'
import { useClients } from '@queries/useClients'
import { useAdmins } from '@queries/useAdmins'
import { Button } from '@components/button'
import { CameraIcon } from 'icons'

export { SettingsModal, createSettingsHref }

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
  const { data: clientData, status: clientStatus } = useClients()
  const { data: adminData, status: adminStatus } = useAdmins()
  // const summaryMutation = useUpdateSummary(projectId)

  const clients = clientData ?? []
  const admins = adminData ?? []

  const disabled = !clientId || !!team || clientStatus || adminStatus

  return (
    <div tw="space-y-8 flex flex-col items-end">
      <label tw="flex flex-col w-full">
        <span tw="bl-text-xs text-gray-yellow-300">Project name</span>
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
          placeholder="Untitled project"
        />
      </label>
      <label tw="flex flex-col w-full" htmlFor="client">
        <span tw="bl-text-xs text-gray-yellow-300">Client</span>
        <select
          id="client"
          name="client"
          css={[
            tw`w-full bl-text-3xl placeholder-gray-yellow-400`,
            tw`focus:outline-none border-b border-gray-yellow-600`,
          ]}
          placeholder="Client"
        >
          <option value="default"></option>
          {clients.map(({ id, name }) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <Button tw="space-x-4 align-middle max-w-max self-start">
        <CameraIcon tw="inline fill-gray-yellow-600" />
        <span tw="bl-text-lg">
          {imageUrl === '' ? 'Upload project image' : 'Change project image'}
        </span>
      </Button>
      <label tw="flex flex-col w-full" htmlFor="client">
        <span tw="bl-text-xs text-gray-yellow-300">Project Team</span>
        <select
          id="client"
          name="client"
          css={[
            tw`w-full bl-text-3xl placeholder-gray-yellow-400`,
            tw`focus:outline-none border-b border-gray-yellow-600`,
          ]}
          placeholder="Project team"
        >
          <option value="default"></option>
          {admins.map(({ id, name }) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <SaveButton
        // onClick={() => {
        //   if (disabled) return
        //   summaryMutation.mutate(
        //     edit === 'description'
        //       ? { id, description: body }
        //       : { id, roadmap: body },
        //     { onSuccess: onDismiss }
        //   )
        // }}
        disabled={disabled}
        error={false}
      >
        {/* {summaryMutation.status === 'loading'
          ? `Saving ${edit}...`
          : `Save ${edit}`} */}
        Save Settings
      </SaveButton>
      <DeleteSection
        tw="mt-16 w-full"
        label="Project name"
        verificationText={name}
        onDelete={() => ({})}
        status={'idle'}
      />
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

function createSettingsHref(projectId: number) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'settings' },
  }
}
