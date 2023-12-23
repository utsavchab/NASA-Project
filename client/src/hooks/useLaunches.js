import { useCallback, useEffect, useState } from 'react'

import { httpGetLaunches, httpSubmitLaunch, httpAbortLaunch } from './requests'

function useLaunches(onSuccessSound, onAbortSound, onFailureSound) {
  const [launches, saveLaunches] = useState([])
  const [isPendingLaunch, setPendingLaunch] = useState(false)

  const getLaunches = useCallback(async () => {
    const fetchedLaunches = await httpGetLaunches()
    saveLaunches(fetchedLaunches)
  }, [])

  useEffect(() => {
    getLaunches()
  }, [getLaunches])

  const submitLaunch = useCallback(
    async (e) => {
      e.preventDefault()
      setPendingLaunch(true)
      const data = new FormData(e.target)
      const launchDate = new Date(data.get('launch-day'))
      const mission = data.get('mission-name')
      const rocket = data.get('rocket-name')
      const target = data.get('planets-selector')
      try {
        const success = await httpSubmitLaunch({
          launchDate,
          mission,
          rocket,
          target,
        })
        if (success) {
          getLaunches()
          setTimeout(() => {
            onSuccessSound()
            setPendingLaunch(false)
          }, 800)
          return true
        } else {
          onFailureSound()
          window.alert('Unexpected Error Occurred')
          setPendingLaunch(false)
          return false
        }
      } catch (err) {
        onFailureSound()
        console.error(err)
        window.alert(err.response?.data?.message)
        setPendingLaunch(false)

        return false
      }
    },
    [getLaunches, onSuccessSound, onFailureSound]
  )

  const abortLaunch = useCallback(
    async (id) => {
      try {
        const success = await httpAbortLaunch(id)

        if (success) {
          getLaunches()
          onAbortSound()
          return true
        } else {
          onFailureSound()
          return false
        }
      } catch (err) {
        onFailureSound()
        console.error(err)
        window.alert(err.response?.data?.message)
        return false
      }
    },
    [getLaunches, onAbortSound, onFailureSound]
  )

  return {
    launches,
    isPendingLaunch,
    submitLaunch,
    abortLaunch,
  }
}

export default useLaunches
