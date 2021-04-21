import { useEffect, useState } from 'react'

export { useWaitTimer }

function useWaitTimer(waitTime: number = 1000): 'waiting' | 'finished' {
  const [wait, setWait] = useState<'waiting' | 'finished'>('waiting')
  useEffect(() => {
    const id = setTimeout(() => {
      setWait('finished')
    }, waitTime)
    return () => clearTimeout(id)
  }, [waitTime])

  return wait
}
