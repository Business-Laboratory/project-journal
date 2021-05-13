import tw, { css, theme } from 'twin.macro'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import {
  useRef,
  useState,
  useMemo,
  forwardRef,
  useEffect,
  FocusEventHandler,
} from 'react'
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
    const [focusedAdmin, setFocusedAdmin] = useFocusAdmin(
      selectedAdmins,
      inputRef
    )

    return (
      <>
        <label htmlFor={id} tw="bl-text-xs text-gray-yellow-300">
          Project team
        </label>
        <div ref={ref} css={inputWrapperCss(disabled)}>
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
                focus={id === focusedAdmin.id}
                onBlur={() => {
                  // if the id didn't change, yet the button blurred, that means all focus was lost
                  if (id === focusedAdmin.id) {
                    setFocusedAdmin({ state: 'idle', id: null })
                  }
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
                selectedAdmins.length === 0 ? 'Search project team...' : ''
              }
              autoComplete="off"
              autocomplete={false}
              disabled={disabled}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              value={searchTerm}
              onKeyDownCapture={(e) => {
                const key = e.key
                // handle deletes and left arrow for navigating the selected elements
                if (!searchTerm && selectedAdmins.length > 0) {
                  if (key === 'Backspace' || e.key === 'Delete') {
                    let newTeam = selectedAdmins.map(({ id }) => id)
                    newTeam.pop()
                    setTeam(newTeam)
                  } else if (key === 'ArrowLeft') {
                    setFocusedAdmin({ state: 'selecting', id: null })
                  }
                }
              }}
            />
          </div>
          <div tw="flex flex-row items-center -mr-3">
            <button
              className="group"
              css={[
                tw`w-12 h-12 hover:text-copper-300 focus:outline-none`,
                css`
                  &.focus-visible > svg {
                    ${tw`ring ring-copper-400`}
                  }
                `,
              ]}
              aria-label="clear all"
              onClick={() => setTeam([])}
            >
              <CloseIcon
                tw="w-4 h-4 m-auto fill-gray-yellow-400 group-hover:fill-copper-300"
                aria-hidden
              />
            </button>
            <button
              tw="w-12 h-12"
              aria-label="open dropdown"
              onClick={() => {
                const input = inputRef.current
                if (input === null) return
                input.focus()
              }}
              tabIndex={-1}
            >
              <ExpandIcon
                className="expand-icon" // target for hover and focus
                tw="w-5 h-5 m-auto fill-gray-yellow-400"
                aria-hidden
              />
            </button>
          </div>
        </div>
      </>
    )
  }
)

type SelectedAdminProps = {
  name: string
  onDelete: () => void
  focus: boolean
  onBlur?: FocusEventHandler<HTMLButtonElement>
}
function SelectedAdmin({ name, onDelete, focus, onBlur }: SelectedAdminProps) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (focus) {
      node.focus()
    } else {
      node.blur()
    }
  }, [focus])

  return (
    <div tw="flex flex-row items-center px-2 bg-copper-400 text-gray-yellow-100 rounded-lg max-w-fit mr-6">
      {name}
      <button
        ref={ref}
        className="group"
        aria-label={`remove ${name} from team`}
        tw="w-6 h-6 ml-3 focus:outline-none"
        onClick={onDelete}
        onBlur={onBlur}
        tabIndex={-1}
      >
        <CloseIcon tw="fill-gray-yellow-100 h-3 w-3 m-auto group-hover:fill-gray-yellow-600 group-focus:(ring-2 ring-copper-100)" />
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
    let adminValues = []
    let selectedAdmins = []
    for (const admin of admins) {
      const { id, name } = admin
      // skip admins without names, they shouldn't be in the database
      if (name === null) continue
      const teamIdx = team.findIndex((teamId) => teamId === id)
      if (teamIdx !== -1) {
        selectedAdmins[teamIdx] = admin
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

/**
 * Handle focus management of SelectedAdmin delete buttons when using arrow keys
 * @param selectedAdmins
 * @param inputRef
 * @returns
 */
function useFocusAdmin(
  selectedAdmins: Admins,
  inputRef: React.MutableRefObject<HTMLInputElement | null>
) {
  const [focusedAdmin, setFocusedAdmin] = useState<{
    state: 'selecting' | 'idle'
    id: number | null
  }>({ state: 'idle', id: null })

  useEffect(() => {
    // if there's a focused admin, then we're still navigating
    if (focusedAdmin.state === 'idle') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const currentId = focusedAdmin.id
      if (key === 'ArrowLeft') {
        if (currentId === null) {
          setFocusedAdmin({
            state: 'selecting',
            id: selectedAdmins[selectedAdmins.length - 1].id,
          })
        } else {
          const focusedAdminIdx = selectedAdmins.findIndex(
            ({ id }) => id === currentId
          )
          // only select a new admin when there are more to select
          if (focusedAdminIdx > 0) {
            setFocusedAdmin({
              state: 'selecting',
              id: selectedAdmins[focusedAdminIdx - 1].id,
            })
          }
        }
      } else if (key === 'ArrowRight') {
        const focusedAdminIdx = selectedAdmins.findIndex(
          ({ id }) => id === currentId
        )
        // refocus the input if the focused admin is the last admin
        if (
          focusedAdminIdx === selectedAdmins.length - 1 ||
          focusedAdminIdx === -1
        ) {
          inputRef.current?.focus()
          setFocusedAdmin({ state: 'idle', id: null })
        } else {
          setFocusedAdmin({
            state: 'selecting',
            id: selectedAdmins[focusedAdminIdx + 1].id,
          })
        }
      } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [focusedAdmin.id, focusedAdmin.state, inputRef, selectedAdmins])

  return [focusedAdmin, setFocusedAdmin] as const
}

// styles

function inputWrapperCss(disabled: boolean) {
  return [
    tw`flex flex-row items-center`,
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
      : null,
  ]
}

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
