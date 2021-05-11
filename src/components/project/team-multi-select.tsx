import tw, { css, theme } from 'twin.macro'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  useComboboxContext,
} from '@reach/combobox'
import { useRef, useState, useMemo, useEffect } from 'react'
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import type { Updates } from '@queries/useUpdates'
import { CloseIcon } from 'icons'

const inputPaddingY = theme('spacing.3')

type TeamMultiSelectProps = {
  updates: Updates
  id?: string
  disabled?: boolean
}
export function TeamMultiSelect({
  updates,
  id = 'team-multi-select',
  disabled = false,
}: TeamMultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const matchedUpdates = useMatchedUpdates(updates, searchTerm)
  const [blurring, setBlurring] = useState(false)

  return (
    <Combobox
      aria-label="search projects"
      openOnFocus
      onSelect={(selectedValue) => {
        const selectedUpdate = matchedUpdates.find(
          ({ value }) => value === selectedValue
        )
        console.log(selectedUpdate)
        setSearchTerm('')
      }}
    >
      <InnerCombobox
        updates={matchedUpdates}
        id={id}
        disabled={disabled}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        blurring={blurring}
        setBlurring={setBlurring}
      />
    </Combobox>
  )
}

/**
 * Inspired by https://github.com/reach/reach-ui/blob/develop/packages/combobox/examples/utils.ts
 * @param term
 */
function useMatchedUpdates(updates: Updates, searchTerm: string) {
  const updateValuesAndHashLinks = useMemo(
    () =>
      updates.map(({ title, hashLink }) => ({
        value: title,
        hashLink,
      })),
    [updates]
  )
  return useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return normalizedSearchTerm === ''
      ? updateValuesAndHashLinks
      : matchSorter(updateValuesAndHashLinks, searchTerm, {
          keys: [(item) => item.value],
        })
  }, [searchTerm, updateValuesAndHashLinks])
}

type InnerComboboxProps = Omit<TeamMultiSelectProps, 'updates'> & {
  updates: ReturnType<typeof useMatchedUpdates>
  searchTerm: string
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>
  blurring: boolean
  setBlurring: (blurring: boolean) => void
}
function InnerCombobox({
  updates,
  id,
  disabled = false,
  searchTerm,
  setSearchTerm,
  blurring,
  setBlurring,
}: InnerComboboxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rect = useRect(containerRef)

  // blur the input after an option has been selected – this can't
  // be added to `onSelect`, because Reach refocuses after clicks
  useBlurOnIdle(inputRef, blurring, setBlurring)

  return (
    <>
      <div
        ref={containerRef}
        css={[
          tw`pb-2 flex flex-row flex-wrap`,
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
        <Pill />
        <Pill />
        <Pill />
        <Pill />
        <ComboboxInput
          id={id}
          ref={inputRef}
          tw="flex-grow placeholder-gray-yellow-300 focus:outline-none disabled:bg-transparent"
          placeholder="Search project updates..."
          autoComplete="off"
          autocomplete={false}
          disabled={disabled}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          value={searchTerm}
        />
      </div>

      <ComboboxPopover css={comboboxPopoverCss(rect)}>
        <ComboboxList>
          {updates.length > 0 ? (
            updates.slice(0, 10).map(({ value }, idx) => {
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
    </>
  )
}

function Pill() {
  return (
    <div tw="flex flex-row items-center px-2 bg-copper-400 text-gray-yellow-100 rounded-lg max-w-fit mr-6 mb-2">
      Tripp Lybrand
      <button
        // TODO: make touch area larger
        tw="w-3 h-3 ml-3"
      >
        <CloseIcon tw="fill-gray-yellow-100 h-3 w-3 " />
      </button>
    </div>
  )
}

function useBlurOnIdle(
  inputRef: React.MutableRefObject<HTMLInputElement | null>,
  blurring: boolean,
  setBlurring: (blurring: boolean) => void
) {
  const { state } = useComboboxContext()

  useEffect(() => {
    if (blurring && state === 'IDLE') {
      inputRef.current?.blur()
      setBlurring(false)
    }
  }, [blurring, inputRef, setBlurring, state])
}

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
