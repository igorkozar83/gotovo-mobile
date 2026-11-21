// useEvent.js
// A function whose identity never changes but which always runs the latest `fn` (with the current props
// and state). Effects can call it, and list it as a dependency, without re-running when `fn` changes.
// For effects and event handlers only: calling it during render would see the previous `fn`.
import { useCallback, useInsertionEffect, useRef } from "react"

const useEvent = (fn) => {
  const latest = useRef(fn)
  // updated before any layout effect or effect of this render runs
  useInsertionEffect(() => {
    latest.current = fn
  })
  return useCallback((...args) => latest.current(...args), [])
}

export default useEvent
