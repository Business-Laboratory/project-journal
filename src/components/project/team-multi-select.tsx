import tw, { css, theme } from 'twin.macro'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  // useComboboxContext,
} from '@reach/combobox'
import { useRef, useState, useMemo, useEffect } from 'react'
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import { CloseIcon, ExpandIcon } from 'icons'
import { useAdmins } from '@queries/useAdmins'

import type { Admins } from '@queries/useAdmins'

const inputPaddingY = theme('spacing.3')

type TeamMultiSelectProps = {
  id?: string
  disabled?: boolean
}
export function TeamMultiSelect({
  id = 'team-multi-select',
  disabled = false,
}: TeamMultiSelectProps) {
  const { data, status } = useAdmins()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAdmins, setSelectedAdmins] = useState<Admins>([])
  const matchedAdmins = useMatchedAdmins(data ?? [], searchTerm)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rect = useRect(containerRef)

  // blur the input after an option has been selected – this can't
  // be added to `onSelect`, because Reach refocuses after clicks
  // const [blurring, setBlurring] = useState(false)
  // useBlurOnIdle(inputRef, blurring, setBlurring)

  useEffect(() => {
    if (data) {
      setSelectedAdmins(data.slice(0, 1))
    }
  }, [data])
  // TODO: pass in as a prop once David's PR is merged in
  if (status !== 'success') {
    return null
  }

  return (
    <Combobox
      aria-label="select project team"
      openOnFocus
      // onSelect={(selectedValue) => {
      //   const selectedUpdate = matchedUpdates.find(
      //     ({ value }) => value === selectedValue
      //   )
      //   console.log(selectedUpdate)
      //   setSearchTerm('')
      // }}
    >
      <label htmlFor={id} tw="bl-text-xs text-gray-yellow-300">
        Project team
      </label>
      <div
        ref={containerRef}
        css={[
          tw`flex flex-row items-center`,
          css`
            /* need to inherit these css properties so the font can be overwritten properly */
            letter-spacing: inherit;
            font-weight: inherit;

            box-shadow: inset 0 -1px 0 0 ${theme('colors[gray-yellow].600')};
            &:focus {
              box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].400')};
            }
            &:hover {
              box-shadow: inset 0 -2px 0 0 ${theme('colors[copper].300')};
            }
          `,
        ]}
      >
        <div tw="flex flex-row flex-wrap items-center flex-grow">
          {selectedAdmins.map(({ name, id }) => (
            <SelectedAdmin key={id} name={name ?? ''} />
          ))}
          {selectedAdmins.map(({ name, id }) => (
            <SelectedAdmin key={id} name={name ?? ''} />
          ))}

          <ComboboxInput
            id={id}
            ref={inputRef}
            tw="flex-grow placeholder-gray-yellow-300 focus:outline-none disabled:bg-transparent my-2"
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
          <button tw="w-12 h-12" aria-label="clear all" onClick={() => {}}>
            <CloseIcon tw="w-3 h-3 m-auto" aria-hidden />
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
            <ExpandIcon tw="w-3 h-3 m-auto" aria-hidden />
          </button>
        </div>
      </div>

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

/**
 * Inspired by https://github.com/reach/reach-ui/blob/develop/packages/combobox/examples/utils.ts
 */
function useMatchedAdmins(admins: Admins, searchTerm: string) {
  const adminValues = useMemo(() => {
    let adminValues = []
    for (const { name } of admins) {
      if (name !== null) {
        adminValues.push({ value: name })
      }
    }
    return adminValues
  }, [admins])

  return useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return normalizedSearchTerm === ''
      ? adminValues
      : matchSorter(adminValues, searchTerm, {
          keys: [(item) => item.value],
        })
  }, [searchTerm, adminValues])
}

type SelectedAdminProps = { name: string }
function SelectedAdmin({ name }: SelectedAdminProps) {
  return (
    <div tw="flex flex-row items-center px-2 bg-copper-400 text-gray-yellow-100 rounded-lg max-w-fit mr-6">
      {name}
      <button
        // TODO: make touch area larger
        tw="w-3 h-3 ml-3"
      >
        <CloseIcon tw="fill-gray-yellow-100 h-3 w-3 " />
      </button>
    </div>
  )
}

// function useBlurOnIdle(
//   inputRef: React.MutableRefObject<HTMLInputElement | null>,
//   blurring: boolean,
//   setBlurring: (blurring: boolean) => void
// ) {
//   const { state } = useComboboxContext()

//   useEffect(() => {
//     if (blurring && state === 'IDLE') {
//       inputRef.current?.blur()
//       setBlurring(false)
//     }
//   }, [blurring, inputRef, setBlurring, state])
// }

// styles

const comboboxPopoverCss = (rect: DOMRect | null) => [
  tw`py-1 bg-gray-yellow-100 border rounded border-copper-400 shadow-bl`,
  css`
    margin-top: calc(${inputPaddingY} + ${theme('spacing.2')});
  `,
  rect
    ? // unfortunately have to pass important in here to override reach's default positioning
      css`
        left: ${rect.left}px !important;
        width: ${rect.width}px !important;
      `
    : null,
]

// const labelCss = (disabled: boolean) => [
//   tw`
//     flex items-center w-full px-8 bl-text-base text-gray-yellow-600
//     ring-1 ring-inset ring-gray-yellow-600
//     focus-within:(ring-2 ring-copper-400)
//   `,
//   !disabled ? tw`hover:(ring-2 ring-copper-300)` : null,
//   css`
//     padding-top: ${inputPaddingY};
//     padding-bottom: ${inputPaddingY};
//   `,
// ]

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
