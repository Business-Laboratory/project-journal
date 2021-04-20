import { useEffect, useState } from 'react'

export { useWaitTimer }

function useWaitTimer(): 'waiting' | 'finished' {
  const [wait, setWait] = useState<'waiting' | 'finished'>('waiting')
  useEffect(() => {
    const id = setTimeout(() => {
      setWait('finished')
    }, 1000)
    return () => clearTimeout(id)
  }, [])

  return wait
}
