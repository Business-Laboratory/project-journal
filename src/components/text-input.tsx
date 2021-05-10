import tw, { css, theme } from 'twin.macro'
import { forwardRef } from 'react'
export { TextInput }
export type { TextInputProps }
type TextInputProps = Omit<React.ComponentPropsWithRef<'input'>, 'onChange'> & {
  label?: string
  onChange: (value: string) => void
}
const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ label, value, onChange, id, className, ...props }, ref) {
    return (
      <div
        css={[tw`bl-text-base`, label ? tw`flex flex-col` : null]}
        className={className}
      >
        {label ? (
          <label htmlFor={id} tw="bl-text-xs text-gray-yellow-300">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={id}
          css={inputCss}
          value={value}
          onChange={(e) => {
            onChange(e.currentTarget.value ?? '')
          }}
          {...props}
        />
      </div>
    )
  }
)
const inputCss = [
  tw`py-1 placeholder-gray-yellow-400 focus:(outline-none) appearance-none`,
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
]
