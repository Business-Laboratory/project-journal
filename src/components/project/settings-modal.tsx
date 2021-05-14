import tw, { css, theme } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useReducer, useState } from 'react'

import { DeleteSection, Modal, SaveButton } from '@components/modal'
import { useClients } from '@queries/useClients'
import { Button } from '@components/button'
import { CameraIcon, ExpandIcon } from 'icons'
import { ProjectMutationBody } from 'pages/api/project'
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

import type { Project } from '@queries/useProject'

export { SettingsModal, createSettingsHref }

type SettingsModalProps = {
  projectId: number | 'new'
  project: Omit<Project, 'id'> // we don't need the id here, since it's already passed in as prop
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
        project={project}
      />
    </Modal>
  )
}

type SettingsEditModalContentProps = SettingsModalProps & {
  onDismiss: () => void
  project: Omit<Project, 'id'> // we don't need the id here, since it's already passed in as prop
}
function SettingsEditModalContent({
  projectId,
  onDismiss,
  project,
}: SettingsEditModalContentProps) {
  const router = useRouter()
  const [{ name, clientId, team }, dispatch] = useReducer(
    settingsReducer,
    initialState(project)
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tempImageUrl, setTempImageUrl] = useState(project.imageUrl)
  const [imageUpload, setImageUpload] = useState<'idle' | 'loading'>('idle')

  const projectMutation = useProjectMutation(projectId)
  const projectDeleteMutation = useDeleteProject()

  const disabled =
    !name || projectMutation.status === 'loading' || imageUpload === 'loading'

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
        projectId !== 'new'
          ? {
              onSuccess: () => {
                setImageUpload('idle')
                onDismiss()
              },
            }
          : undefined
      )
    } else {
      projectMutation.mutate(
        { id: projectId, name, clientId, team },
        projectId !== 'new' ? { onSuccess: onDismiss } : undefined
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
          ? `Saving settings...`
          : `Save settings`}
      </SaveButton>
      {projectId !== 'new' ? (
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
      ) : null}
    </div>
  )
}

type SettingsState = Omit<ProjectMutationBody, 'imageStorageBlobUrl' | 'id'>
const initialState = ({
  name,
  client,
  team,
}: Pick<Project, 'name' | 'client' | 'team'>): SettingsState => ({
  name: name ?? '',
  clientId: client?.id ?? null,
  team: team.map(({ id }) => id) ?? [],
})

type ActionType =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_CLIENT'; payload: number | null }
  | { type: 'SET_TEAM'; payload: number[] }

function settingsReducer(state: SettingsState, action: ActionType) {
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
  client: number | null
  onChange: (newValue: string) => void
}
function ClientSelect({ label, client, onChange }: ClientSelectProps) {
  const { data: clients, status } = useClients()

  const disabled = status !== 'success'

  return (
    <ListboxInput
      css={[tw`w-full`]}
      aria-labelledby={label}
      value={status !== 'success' || client === null ? '-1' : client.toString()}
      onChange={(value) => onChange(value)}
      disabled={disabled}
    >
      <ListboxButton
        css={[
          tw`flex justify-between items-center bl-text-3xl border-none`,
          tw`p-0 bl-text-3xl flex justify-between items-center focus:outline-none`,
          !client ? tw`text-gray-yellow-400` : tw`text-gray-yellow-600`,
          css`
            box-shadow: inset 0 -1px 0 0 ${theme('colors[gray-yellow].600')};
          `,
          !disabled
            ? css`
                &:focus,
                &:focus-within {
                  box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].400')};
                  .expand-icon {
                    ${tw`fill-copper-400`}
                  }
                }
                &:hover {
                  box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].300')};
                  .expand-icon {
                    ${tw`fill-copper-300`}
                  }
                }
              `
            : // right now we just get rid of focus styles for disabled states, though it probably should have it's own state
              css`
                opacity: 1 !important;
              `,
        ]}
        arrow={
          <ExpandIcon
            aria-hidden
            className="expand-icon" // target for hover and focus
            tw="fill-gray-yellow-400 w-5 h-5"
          />
        }
      />
      <ListboxPopover
        css={[
          tw`bg-gray-yellow-100 mt-2 shadow-bl focus-within:shadow-bl`,
          tw`border rounded border-copper-400`,
          css`
            &[data-reach-listbox-popover]:focus-within {
              ${tw`outline-none`}
            }
          `,
        ]}
      >
        <ListboxList tw="bl-text-xs my-2">
          <ListboxOption
            css={[...listboxOptionCss, tw`text-gray-yellow-400`]}
            value={'-1'}
          >
            Select client
          </ListboxOption>
          {clients?.map(({ id, name }) => (
            <ListboxOption
              css={listboxOptionCss}
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

const listboxOptionCss = [
  tw`py-2 px-4 bl-text-xs hover:bg-copper-100`,
  css`
    &[data-current-selected] {
      ${tw`bl-text-xs text-copper-400`}
    }
    &[data-current-nav] {
      ${tw`text-gray-yellow-600 bg-copper-100`}
    }
  `,
]

function createSettingsHref(projectId: number | 'new') {
  return {
    pathname: `/project/${projectId}`,
    query: { edit: 'settings' },
  }
}
