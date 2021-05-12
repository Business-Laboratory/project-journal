import tw, { css, theme } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useReducer, useState } from 'react'

import { DeleteSection, Modal, SaveButton } from '@components/modal'
import { useClients } from '@queries/useClients'
import { Button } from '@components/button'
import { CameraIcon, ExpandIcon } from 'icons'
import { ClientsData } from 'pages/api/clients'
import { ProjectData, ProjectMutationBody } from 'pages/api/project'
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from '@reach/listbox'
import '@reach/listbox/styles.css'
import Image from 'next/image'
import { TeamMultiSelect } from './team-multi-select'
import { useProjectMutation } from '@queries/useProjectMutation'
import { useDeleteProject } from '@queries/useDeleteProject'
import { TextInput } from '@components/text-input'

export { SettingsModal, createSettingsHref }

type SettingsModalProps = {
  projectId: number
  project: ProjectData
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
  project: ProjectData
}
function SettingsEditModalContent({
  projectId,
  onDismiss,
  edit,
  project,
}: SettingsEditModalContentProps) {
  const router = useRouter()
  const [{ name, clientId, team }, dispatch] = useReducer(
    settingsReducer,
    initialState(project)
  )
  const { data: clientsData, status: clientsStatus } = useClients()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tempImageUrl, setTempImageUrl] = useState(project.imageUrl)
  const [imageUpload, setImageUpload] = useState<'idle' | 'loading'>('idle')

  const projectMutation = useProjectMutation(projectId)
  const projectDeleteMutation = useDeleteProject()

  const disabled =
    checkDisabled(project, name, imageFile, clientId, team, clientsStatus) ||
    projectMutation.status === 'loading' ||
    imageUpload === 'loading'

  const handleProjectSave = async () => {
    if (imageFile !== null) {
      setImageUpload('loading')
      const result = await fetch('/api/generate-upload-blob-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          fileName: imageFile?.name,
        }),
      })
      const { sasUrl } = await result.json()

      // lazy load the image uploader since it's pretty large
      const { uploadImage } = await import('@utils/upload-image')

      const imageStorageBlobUrl = await uploadImage(sasUrl, imageFile)
      projectMutation.mutate(
        { id: projectId, name, imageStorageBlobUrl, clientId, team },
        {
          onSuccess: () => {
            setImageUpload('idle')
            onDismiss()
          },
        }
      )
    } else {
      projectMutation.mutate(
        { id: projectId, name, clientId, team },
        { onSuccess: onDismiss }
      )
    }
  }

  return (
    <div tw="space-y-8 flex flex-col items-end">
      <TextInput
        tw="w-full bl-text-3xl"
        value={name}
        onChange={(newName) => dispatch({ type: 'SET_NAME', payload: newName })}
        label="Project name"
        placeholder="Untitled project"
      />
      <label tw="flex flex-col w-full" htmlFor="client-select">
        <span id="client-select" tw="bl-text-xs text-gray-yellow-300">
          Client
        </span>
        <ClientSelect
          label={'client-select'}
          clients={clientsData ?? []}
          client={clientId}
          onChange={(value) =>
            dispatch({ type: 'SET_CLIENT', payload: Number(value) })
          }
        />
      </label>
      <div tw="flex flex-row w-full justify-between space-x-8">
        <Button tw="min-w-min self-start inline-flex">
          <label htmlFor="image" tw="space-x-4 items-center inline-flex">
            <CameraIcon tw="inline fill-gray-yellow-600 w-5 h-5" />
            <span tw="bl-text-lg">
              {!tempImageUrl ? 'Upload project image' : 'Change project image'}
            </span>
            <input
              tw="w-full h-full"
              hidden
              type="file"
              id="image"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.readAsDataURL(file)
                  reader.onload = () => {
                    setTempImageUrl(reader.result?.toString() ?? '')
                    setImageFile(file)
                  }
                }
              }}
              name="img"
              accept="image/*"
            />
          </label>
        </Button>
        {/*Hardcoded width and height*/}
        {tempImageUrl !== null ? (
          <div tw="relative self-end w-64 h-36">
            <Image
              tw="object-cover"
              layout="fill"
              src={tempImageUrl}
              alt={name}
            />
          </div>
        ) : null}
      </div>
      <div tw="w-full">
        <TeamMultiSelect
          team={team}
          setTeam={(newTeam) => {
            dispatch({ type: 'SET_TEAM', payload: newTeam })
          }}
        />
      </div>
      <SaveButton
        onClick={() => {
          if (disabled) return
          handleProjectSave()
        }}
        disabled={disabled}
        error={projectMutation.status === 'error'}
      >
        {projectMutation.status === 'loading' || imageUpload === 'loading'
          ? `Saving ${edit}...`
          : `Save ${edit}`}
      </SaveButton>
      <DeleteSection
        tw="mt-16 w-full"
        label="Verify project name"
        verificationText={name || 'Project Name'}
        buttonText={
          projectDeleteMutation.status === 'loading'
            ? 'Deleting...'
            : 'Delete project'
        }
        onDelete={() => {
          projectDeleteMutation.mutate(projectId, {
            onSuccess: () => {
              router.push('/projects')
            },
          })
        }}
        status={projectDeleteMutation.status}
      />
    </div>
  )
}

const initialState = ({
  name,
  client,
  team,
}: ProjectData): Omit<ProjectMutationBody, 'imageStorageBlobUrl' | 'id'> => ({
  name: name ?? '',
  clientId: client?.id ?? null,
  team: team.map(({ id }) => id) ?? [],
})

type ActionType =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_CLIENT'; payload: number | null }
  | { type: 'SET_TEAM'; payload: number[] }

function settingsReducer(
  state: ReturnType<typeof initialState>,
  action: ActionType
) {
  switch (action.type) {
    case 'SET_NAME': {
      return { ...state, name: action.payload }
    }
    case 'SET_CLIENT': {
      if (!action.payload || action.payload < 0) {
        return { ...state, clientId: null }
      }
      return { ...state, clientId: action.payload }
    }
    case 'SET_TEAM': {
      return { ...state, team: action.payload }
    }
  }
}

type ClientSelectProps = {
  label: string
  clients: ClientsData
  client: number | null
  onChange: (newValue: string) => void
}
function ClientSelect({ label, clients, client, onChange }: ClientSelectProps) {
  return (
    <ListboxInput
      css={[tw`w-full`]}
      aria-labelledby={label}
      value={client?.toString() ?? '-1'}
      onChange={(value) => onChange(value)}
    >
      <ListboxButton
        css={[
          tw`flex justify-between items-center bl-text-3xl`,
          tw`border-0 border-b border-gray-yellow-600`,
          tw`hover:border-copper-300 focus:border-copper-400 focus:outline-none`,
          tw`p-0 bl-text-3xl flex justify-between items-center focus:outline-none`,
          !client ? tw`text-gray-yellow-400` : tw`text-gray-yellow-600`,
          css`
            &[data-reach-listbox-button]:focus-visible {
              ${tw`outline-none`}
            }
            &[data-reach-listbox-button][aria-expanded='true'] {
              ${tw`border-copper-400`}
            }
          `,
        ]}
        arrow={<ExpandIcon tw="fill-gray-yellow-400 w-4 h-4" />}
      />
      <ListboxPopover
        css={[
          tw`bg-gray-yellow-100 mt-6 shadow-bl focus-within:shadow-bl`,
          tw`border rounded border-copper-400`,
          // Don't know if we can not hardcode the font weight
          css`
            [data-reach-listbox-option][data-current-selected] {
              font-weight: 500;
              color: ${theme('colors[copper].400')};
            }
            [data-reach-listbox-option][data-current-nav] {
              color: ${theme('colors[gray-yellow].600')};
              background-color: ${theme('colors[copper].100')};
            }
            &[data-reach-listbox-popover]:focus-within {
              ${tw`outline-none`}
            }
          `,
        ]}
      >
        <ListboxList tw="bl-text-xs my-2">
          <ListboxOption
            css={[tw`text-gray-yellow-400 py-2 px-4`, tw`hover:bg-copper-100`]}
            value={'-1'}
          >
            Select client
          </ListboxOption>
          {clients?.map(({ id, name }) => (
            <ListboxOption
              css={[tw`py-2 px-4`, tw`hover:bg-copper-100`]}
              key={id}
              value={id.toString()}
            >
              {name}
            </ListboxOption>
          ))}
        </ListboxList>
      </ListboxPopover>
    </ListboxInput>
  )
}

function createSettingsHref(projectId: number) {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'settings' },
  }
}

// TODO: clean this up
const checkDisabled = (
  project: ProjectData,
  name: string,
  file: File | null,
  clientId: number | null,
  team: number[],
  clientsStatus: 'error' | 'idle' | 'loading' | 'success'
) => {
  if (
    (project.name === name && !file && project.client?.id === clientId) ||
    clientsStatus === 'loading' ||
    clientsStatus === 'error'
  ) {
    return true
  }
  return false
}
