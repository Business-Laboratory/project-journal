import tw, { css } from 'twin.macro'

export function SearchBar() {
  return (
    <input
      css={[
        tw`block w-full py-3 px-8`,
        tw`border border-gray-yellow-600 hover:border-2 focus:border-2 hover:border-copper-300 focus:border-copper-300`,
        css`
          &:hover,
          &:focus {
            margin: -1px;
          }
        `,
      ]}
      type="search"
      id="searchbar"
      placeholder="Search project updates..."
    />
  )
}
