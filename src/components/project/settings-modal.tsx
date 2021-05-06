import tw, { css, theme } from 'twin.macro'
import { useRouter } from 'next/router'
import React, { useReducer } from 'react'

import { DeleteSection, Modal, SaveButton } from '@components/modal'
import { Project } from '@queries/useProject'
import { User } from '@queries/useUser'
import { useClients } from '@queries/useClients'
import { useAdmins } from '@queries/useAdmins'
import { Button } from '@components/button'
import { CameraIcon, ExpandIcon } from 'icons'
import { ClientsData } from 'pages/api/clients'
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from '@reach/listbox'
import '@reach/listbox/styles.css'
import Image from 'next/image'

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

  const disabled =
    !clientId || !!team || clientStatus || adminStatus || !adminData

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
      <label tw="flex flex-col w-full" htmlFor="client-select">
        <span id="client-select" tw="bl-text-xs text-gray-yellow-300">
          Client
        </span>
        <ClientSelect
          label={'client-select'}
          clients={clientData}
          client={clientId}
          onChange={(value) =>
            dispatch({ type: 'SET_CLIENT', payload: Number(value) })
          }
        />
      </label>
      <div tw="grid grid-cols-2">
        <Button tw="space-x-4 col-span-1 align-middle max-w-max self-start inline-block">
          <CameraIcon tw="inline fill-gray-yellow-600" />
          <span tw="bl-text-lg">
            {imageUrl === '' ? 'Upload project image' : 'Change project image'}
          </span>
        </Button>
        <div tw="relative col-span-1">
          <Image tw="object-cover" layout="fill" src={imageUrl} alt={name} />
        </div>
      </div>
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
        label="Verify project name"
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
      console.log('hello')
      if (!action.payload || action.payload < 0) {
        return { ...state, clientId: null } as ReturnType<typeof initialState>
      }
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

type ClientSelectProps = {
  label: string
  clients: ClientsData
  client: number | null
  onChange: (newValue: string) => void
}
function ClientSelect({ label, clients, client, onChange }: ClientSelectProps) {
  return (
    <ListboxInput
      css={[
        tw`w-full`,
        tw`border-b border-gray-yellow-600`,
        tw`hover:border-copper-300 focus:border-copper-400 focus:outline-none`,
        css`
          &[data-reach-listbox-input][data-state='expanded'] {
            border-color: ${theme('colors[copper].400')};
          }
        `,
      ]}
      aria-labelledby={label}
      value={client?.toString() ?? '-1'}
      onChange={(value) => onChange(value)}
    >
      <ListboxButton
        css={[tw`p-0 bl-text-3xl flex justify-between items-center`]}
        tw="flex justify-between items-center bl-text-3xl border-none"
        arrow={<ExpandIcon tw="fill-gray-yellow-400 w-6 h-6" />}
      />
      <ListboxPopover
        css={[
          tw`z-50 bg-gray-yellow-100 mt-6 shadow-bl focus-within:shadow-bl`,
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
