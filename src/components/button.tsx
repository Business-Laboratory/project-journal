import tw from 'twin.macro'

export { Button }
export type { ButtonProps }

type ButtonProps = React.ComponentPropsWithoutRef<'button'>

// TODO: Add variant for "danger" button
function Button({ disabled, ...props }: ButtonProps) {
  return (
    <button
      css={[
        tw`px-2 py-1 uppercase border-2 border-copper-300 bl-text-lg`,
        disabled
          ? tw`cursor-not-allowed bg-gray-yellow-300 bg-opacity-60 text-gray-yellow-600 text-opacity-60`
          : tw`hover:bg-copper-400 hover:text-gray-yellow-100
          focus:outline-none focus-visible:ring-2 focus-visible:ring-copper-400`,
      ]}
      disabled={disabled}
      {...props}
    />
  )
}
