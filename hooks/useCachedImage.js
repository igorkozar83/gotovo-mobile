// useCachedImage.js
// A remote image kept in the device cache: resolves to the cached file (downloaded the first time), or
// to the remote uri when caching fails.
import { useEffect, useState } from "react"
import * as FileSystem from "expo-file-system/legacy"
import { reportError } from "../Helpers/reportError"

const useCachedImage = (uri, cacheName) => {
  const [local, setLocal] = useState(null)

  useEffect(() => {
    let active = true
    const cache = async () => {
      if (!uri) return setLocal(null)
      const file = `${FileSystem.cacheDirectory}-${cacheName}-${parseInt(uri.replace(/[^0-9]/g, ""), 10)}`
      try {
        const { exists } = await FileSystem.getInfoAsync(file)
        if (!exists) {
          setLocal(null)
          await FileSystem.downloadAsync(uri, file)
        }
        if (active) setLocal(file)
      } catch (e) {
        reportError(e, "useCachedImage")
        if (active) setLocal(uri)
      }
    }
    cache()
    return () => {
      active = false
    }
  }, [uri, cacheName])

  return local
}

export default useCachedImage
