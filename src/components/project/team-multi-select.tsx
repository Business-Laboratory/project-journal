import tw, { css, theme } from 'twin.macro'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import { useRef, useState, useMemo, forwardRef } from 'react'
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import { CloseIcon, ExpandIcon } from 'icons'
import { useAdmins } from '@queries/useAdmins'

import type { Admins } from '@queries/useAdmins'

const inputMarginY = theme('spacing.3')

type TeamMultiSelectProps = {
  team: number[]
  setTeam: (admins: number[]) => void
  id?: string
  disabled?: boolean
}
export function TeamMultiSelect({
  team,
  setTeam,
  id = 'team-multi-select',
  disabled = false,
}: TeamMultiSelectProps) {
  const { data, status } = useAdmins()
  const [searchTerm, setSearchTerm] = useState('')
  const { matchedAdmins, selectedAdmins } = useMatchedAndSelectedAdmins(
    data ?? [],
    team,
    searchTerm
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const rect = useRect(containerRef)

  return (
    <Combobox
      aria-label="select project team"
      openOnFocus
      onSelect={(selectedValue) => {
        if (!data) return
        const selectedAdmin = data.find(({ name }) => name === selectedValue)
        if (!selectedAdmin) {
          throw new Error(`No admin found with the id ${id}`)
        }
        setTeam(team.concat(selectedAdmin.id))
        setSearchTerm('')
      }}
    >
      <MultiSelectInput
        ref={containerRef}
        id={id}
        disabled={status === 'success' ? disabled : true}
        selectedAdmins={selectedAdmins}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setTeam={setTeam}
      />

      <ComboboxPopover css={comboboxPopoverCss(rect)}>
        <ComboboxList>
          {matchedAdmins.length > 0 ? (
            matchedAdmins.slice(0, 10).map(({ value }, idx) => {
              return (
                <ComboboxOption
                  key={idx} // key has to be index to that using the arrow keys has the correct order
                  css={comboboxOptionCss}
                  value={value}
                >
                  <ComboboxOptionText />
                </ComboboxOption>
              )
            })
          ) : (
            <span css={optionCss}>No results</span>
          )}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  )
}

type MultiSelectInputProps = {
  id: string
  disabled: boolean
  selectedAdmins: Admins
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  setTeam: (admins: number[]) => void
}
const MultiSelectInput = forwardRef<HTMLDivElement, MultiSelectInputProps>(
  function MultiSelectInput(
    { id, disabled, selectedAdmins, searchTerm, setSearchTerm, setTeam },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    return (
      <>
        <label htmlFor={id} tw="bl-text-xs text-gray-yellow-300">
          Project team
        </label>
        <div ref={ref} className="group" css={wrapperCss(disabled)}>
          <div tw="flex flex-row flex-wrap items-center flex-grow">
            {selectedAdmins.map(({ name, id }) => (
              <SelectedAdmin
                key={id}
                name={name ?? ''}
                onDelete={() => {
                  let newTeam = []
                  for (const admin of selectedAdmins) {
                    if (admin.id === id) continue
                    newTeam.push(admin.id)
                  }
                  setTeam(newTeam)
                }}
              />
            ))}

            <ComboboxInput
              id={id}
              ref={inputRef}
              tw="flex-grow placeholder-gray-yellow-300 focus:outline-none disabled:bg-transparent"
              css={css`
                margin-top: ${inputMarginY};
                margin-bottom: ${inputMarginY};
              `}
              placeholder={
                'Search project team...'
                // selectedAdmins.length > 0 ? 'Search project team...' : ''
              }
              autoComplete="off"
              autocomplete={false}
              disabled={disabled}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              value={searchTerm}
            />
          </div>
          <div tw="flex flex-row items-center">
            <button
              tw="w-12 h-12"
              aria-label="clear all"
              onClick={() => setTeam([])}
            >
              <CloseIcon tw="w-4 h-4 m-auto" aria-hidden />
            </button>
            <button
              tw="w-12 h-12"
              aria-label="open dropdown"
              onClick={() => {
                const input = inputRef.current
                if (input === null) return
                input.focus()
              }}
            >
              <ExpandIcon tw="w-4 h-4 m-auto" aria-hidden />
            </button>
          </div>
        </div>
      </>
    )
  }
)

function wrapperCss(disabled: boolean) {
  return [
    tw`flex flex-row items-center group-hover:`,
    css`
      /* need to inherit these css properties so the font can be overwritten properly */
      letter-spacing: inherit;
      font-weight: inherit;
      box-shadow: inset 0 -1px 0 0 ${theme('colors[gray-yellow].600')};
    `,
    !disabled
      ? css`
          &:focus,
          &:focus-within {
            box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].400')};
          }
          &:hover {
            box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].300')};
          }
        `
      : null,
  ]
}

type SelectedAdminProps = { name: string; onDelete: () => void }
function SelectedAdmin({ name, onDelete }: SelectedAdminProps) {
  return (
    <div tw="flex flex-row items-center px-2 bg-copper-400 text-gray-yellow-100 rounded-lg max-w-fit mr-6">
      {name}
      <button
        // TODO: make touch area larger
        tw="w-3 h-3 ml-3"
        onClick={onDelete}
      >
        <CloseIcon tw="fill-gray-yellow-100 h-3 w-3 " />
      </button>
    </div>
  )
}

function useMatchedAndSelectedAdmins(
  admins: Admins,
  team: number[],
  searchTerm: string
) {
  const { adminValues, selectedAdmins } = useMemo(() => {
    const selectedIds = new Set(team)
    let adminValues = []
    let selectedAdmins = []
    for (const admin of admins) {
      const { id, name } = admin
      // skip admins without names, they shouldn't be in the database
      if (name === null) continue
      if (selectedIds.has(id)) {
        selectedAdmins.push(admin)
      } else {
        adminValues.push({ value: name })
      }
    }
    return { adminValues, selectedAdmins }
  }, [admins, team])

  const matchedAdmins = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return normalizedSearchTerm === ''
      ? adminValues
      : matchSorter(adminValues, searchTerm, {
          keys: [(item) => item.value],
        })
  }, [searchTerm, adminValues])

  return { matchedAdmins, selectedAdmins }
}

// styles

const comboboxPopoverCss = (rect: DOMRect | null) => [
  tw`py-1 bg-gray-yellow-100 border rounded border-copper-400 shadow-bl`,
  css`
    margin-top: calc(${inputMarginY} + ${theme('spacing.2')});
  `,
  rect
    ? // unfortunately have to pass important in here to override reach's default positioning
      css`
        left: ${rect.left}px !important;
        width: ${rect.width}px !important;
      `
    : null,
]

const optionCss = tw`block px-8 py-2 bl-text-xs`

const comboboxOptionCss = [
  optionCss,
  css`
    &[aria-selected='true'],
    :hover {
      ${tw`bg-copper-100`}
    }
    [data-user-value] {
      ${tw`text-matisse-blue-100`}
    }
  `,
]
