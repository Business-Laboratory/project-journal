import tw from 'twin.macro'

export { Button }
export type { ButtonProps }

type ButtonProps = React.ComponentPropsWithoutRef<'button'>

// TODO: Add variant for "danger" button
function Button({ disabled, ...props }: ButtonProps) {
  return (
    <button
      css={[
        tw`py-1 px-2 border-2 border-copper-300 bl-text-lg uppercase hover:(ring-1 ring-copper-300) focus:(outline-none ring-2 ring-copper-300)`,
        disabled
          ? tw`bg-gray-yellow-300 text-gray-yellow-500 hover:(ring-0) focus:(ring-0) bg-opacity-60`
          : null,
      ]}
      disabled={disabled}
      {...props}
    />
  )
}
