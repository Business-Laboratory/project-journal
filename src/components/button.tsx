import tw, { css } from 'twin.macro'

export { Button }
export type { ButtonProps }

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  // Add more to this when we get more variants (danger, ect.)
  variant?: 'important'
}

// TODO: Add variant for "danger" button
function Button({ disabled, variant, ...props }: ButtonProps) {
  //Ring color is copper-400
  return (
    <button
      css={[
        tw`px-2 py-1 uppercase border-copper-300 bl-text-lg`,
        variant === 'important' ? tw`border-4` : tw`border-2`,
        disabled
          ? tw`cursor-not-allowed bg-gray-yellow-300 bg-opacity-60 text-gray-yellow-600 text-opacity-60`
          : [
              tw`hover:bg-copper-400 hover:text-gray-yellow-100
          focus:outline-none`,
              css`
                &.focus-visible {
                  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
                    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                  box-shadow: var(--tw-ring-offset-shadow),
                    var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
                  --tw-ring-opacity: 1;
                  --tw-ring-color: rgba(171, 133, 94, var(--tw-ring-opacity));
                }
              `,
            ],
      ]}
      disabled={disabled}
      {...props}
    />
  )
}
