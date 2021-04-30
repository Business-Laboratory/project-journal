import { useWaitTimer } from '@utils/use-wait-timer'
import { SpinnerIcon } from 'icons'
import 'twin.macro'

export { LoadingSpinner }
export type { LoadingSpinnerProps }

type LoadingSpinnerProps = {
  loadingMessage?: string
  waitTime?: number
}
function LoadingSpinner({ loadingMessage, waitTime }: LoadingSpinnerProps) {
  const wait = useWaitTimer(waitTime)

  if (wait === 'waiting') {
    return null
  }

  return (
    <div tw="space-y-4">
      <SpinnerIcon tw="animate-spin w-20 h-20 max-w-max mx-auto" />
      <p tw="bl-text-sm text-center">{loadingMessage}</p>
    </div>
  )
}
