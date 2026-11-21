// useLiveChannel.js
import { useEffect, useRef } from "react"

import { subscribe } from "../Services/live"

// Calls handler(payload) for every event on the socket channel while mounted. A falsy name
// (e.g. logged out) subscribes to nothing. The latest handler is always the one called.
const useLiveChannel = (name, handler) => {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!name) return
    return subscribe(name, (payload) => handlerRef.current(payload))
  }, [name])
}

export default useLiveChannel
