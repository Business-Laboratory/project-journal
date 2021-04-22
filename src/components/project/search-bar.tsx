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
import { useRect } from '@reach/rect'
import { matchSorter } from 'match-sorter'

import { SearchIcon } from 'icons'

import type { ComboboxOptionProps } from '@reach/combobox'

// import '@reach/combobox/styles.css'

const inputPaddingY = theme('spacing.3')

const fruit = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Kiwi']

type SearchBarProps = {
  id?: string
}
export function SearchBar({ id = 'projects-search-bar' }: SearchBarProps) {
  const ref = useRef<HTMLLabelElement | null>(null)
  const rect = useRect(ref)
  const [searchTerm, setSearchTerm] = useState('')

  const matchedProjects = useProjectMatch(searchTerm)

  return (
    <Combobox aria-label="search projects" openOnFocus>
      <label
        ref={ref}
        htmlFor={id}
        css={[
          tw`
            flex items-center w-full px-8 bl-text-base text-gray-yellow-600
            ring-1 ring-inset ring-gray-yellow-600
            hover:(ring-2 ring-copper-300) focus-within:(ring-2 ring-copper-400)
          `,
          css`
            padding-top: ${inputPaddingY};
            padding-bottom: ${inputPaddingY};
          `,
        ]}
      >
        <SearchIcon tw="w-5 h-5" />
        <ComboboxInput
          id={id}
          tw="ml-3 w-full placeholder-gray-yellow-300 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          placeholder="Search project updates..."
          autoComplete="off"
          autocomplete={false}
        />
      </label>
      <ComboboxPopover
        css={[
          tw`py-1 bg-white border rounded border-copper-400`,
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
        ]}
      >
        {matchedProjects ? (
          <ComboboxList>
            {matchedProjects.slice(0, 10).map((value) => {
              return <CustomComboboxOption key={value} value={value} />
            })}
          </ComboboxList>
        ) : null}
      </ComboboxPopover>
    </Combobox>
  )
}

function CustomComboboxOption(props: ComboboxOptionProps) {
  return (
    <ComboboxOption
      css={[
        tw`px-8 py-2 bl-text-xs`,
        css`
          &[aria-selected='true'] {
            ${tw`bg-copper-100`}
          }
          :hover {
            ${tw`bg-copper-400 text-gray-yellow-100`}
          }

          /* [data-suggested-value] {
            color: red;
          } */

          /* [data-user-value] {
            ${tw`text-gray-yellow-500`}
          } */
        `,
      ]}
      children={<ComboboxOptionText />}
      {...props}
    />
  )
}

/**
 * Inspired by https://github.com/reach/reach-ui/blob/develop/packages/combobox/examples/utils.ts
 * @param term
 */
function useProjectMatch(searchTerm: string) {
  return useMemo(() => {
    return searchTerm.trim() === ''
      ? null
      : matchSorter(fruit, searchTerm, {
          keys: [(item) => `${item}`],
        })
  }, [searchTerm])
}
