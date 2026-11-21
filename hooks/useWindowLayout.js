// useWindowLayout.js
// Where a view sits in the window, to place something (a menu) next to it. Returns [layout, onLayout,
// measure]; give onLayout to the view. A view in a list or a sliding top moves without a new layout, so
// measure(then) reads where it is now and then calls then() (open the menu after it).
import { useCallback, useRef, useState } from "react"

const useWindowLayout = () => {
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const view = useRef(null)

  const measure = useCallback((then) => {
    if (!view.current) return then && then()
    view.current.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height })
      if (then) then()
    })
  }, [])

  const onLayout = (event) => {
    view.current = event.target
    measure()
  }
  return [layout, onLayout, measure]
}

export default useWindowLayout
