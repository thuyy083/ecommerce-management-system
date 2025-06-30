// hooks/useDeviceId.js
import { useEffect, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState(null)

  useEffect(() => {
    async function loadFingerprint() {
      const cached = localStorage.getItem('device_id')
      if (cached) {
        setDeviceId(cached)
        return
      }

      const fp = await FingerprintJS.load()
      const result = await fp.get()
      const id = result.visitorId

      localStorage.setItem('device_id', id)
      setDeviceId(id)
    }

    loadFingerprint()
  }, [])

  return deviceId
}
