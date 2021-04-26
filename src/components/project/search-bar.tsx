import tw, { css, theme } from 'twin.macro'
import { useRef, useState, useMemo } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from '@reach/combobox'
import { useRouter } from 'next/router'
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import { SearchIcon, SearchIconDisabled } from 'icons'

import type { Updates } from 'pages/project/[id]'

const inputPaddingY = theme('spacing.3')

type SearchBarProps = {
  updates: Updates
  id?: string
  status: string
}
export function SearchBar({
  updates,
  id = 'projects-search-bar',
  status,
}: SearchBarProps) {
  const router = useRouter()
  const labelRef = useRef<HTMLLabelElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rect = useRect(labelRef)
  const [searchTerm, setSearchTerm] = useState('')
  const matchedUpdates = useMatchedUpdates(updates, searchTerm)

  return (
    <Combobox
      aria-label="search projects"
      openOnFocus
      onSelect={(selectedValue) => {
        setSearchTerm(selectedValue)
        const selectedUpdate = matchedUpdates.find(
          ({ value }) => value === selectedValue
        )
        const hashLink = selectedUpdate?.hashLink
        if (hashLink) {
          inputRef.current?.blur()
          router.push(`./${router.query.id}${hashLink}`)
        }
      }}
    >
      <label ref={labelRef} htmlFor={id} css={labelCss(status, updates)}>
        {status === 'loading' || status === 'error' || updates.length === 0 ? (
          <SearchIconDisabled tw="w-5 h-5" />
        ) : (
          <SearchIcon tw="w-5 h-5" />
        )}
        <ComboboxInput
          disabled={
            status === 'loading' || status === 'error' || updates.length === 0
              ? true
              : false
          }
          id={id}
          ref={inputRef}
          tw="ml-3 w-full placeholder-gray-yellow-300 focus:outline-none"
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          placeholder="Search project updates..."
          autoComplete="off"
          autocomplete={false}
        />
      </label>

      <ComboboxPopover css={comboboxPopoverCss(rect)}>
        <ComboboxList>
          {matchedUpdates.length > 0 ? (
            matchedUpdates.slice(0, 10).map(({ value }, idx) => {
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

// styles

const comboboxPopoverCss = (rect: DOMRect | null) => [
  tw`py-1 bg-white border rounded border-copper-400 shadow-bl`,
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

const labelCss = (status: string, updates: Updates) => [
  status === 'loading' || status === 'error' || updates.length === 0
    ? tw`flex items-center w-full px-8 bl-text-base text-gray-yellow-600
    ring-1 ring-inset ring-gray-yellow-600
    focus-within:(ring-2 ring-copper-400)`
    : tw`
    flex items-center w-full px-8 bl-text-base text-gray-yellow-600
    ring-1 ring-inset ring-gray-yellow-600
    hover:(ring-2 ring-copper-300) focus-within:(ring-2 ring-copper-400)
  `,
  css`
    padding-top: ${inputPaddingY};
    padding-bottom: ${inputPaddingY};
  `,
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
