// useFocusScroll.js
// Scrolls a form so the focused field stays above the keyboard. Each field reports where it is
// (fieldLayout) and when it gets focus (fieldFocus). The keyboard's height is known once it has shown
// for the first time; until then focusing doesn't scroll, and the field focused first scrolls when it is.
//   keyboardEvents: "Will" (iOS only) or "Did"
//   target(fieldY, keyboardHeight): the scroll position for a field
import { useEffect, useRef, useState } from "react"
import { Keyboard } from "react-native"

import useEvent from "../useEvent"

const useFocusScroll = ({ keyboardEvents, target }) => {
  const scrollRef = useRef(null)
  const positions = useRef([])
  const scrolledOnce = useRef(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [focused, setFocused] = useState(null)

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener(`keyboard${keyboardEvents}Show`, (e) => {
        setKeyboardVisible(true)
        setKeyboardHeight(e.endCoordinates.height)
      }),
      Keyboard.addListener(`keyboard${keyboardEvents}Hide`, () => setKeyboardVisible(false))
    ]
    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [keyboardEvents])

  const scrollTo = useEvent((index) => {
    if (!scrollRef.current || !keyboardHeight || positions.current[index] === undefined) return
    scrollRef.current.scrollTo({ x: 0, y: target(positions.current[index], keyboardHeight), animated: true })
  })

  useEffect(() => {
    if (!keyboardHeight || scrolledOnce.current) return
    scrolledOnce.current = true
    scrollTo(focused)
  }, [keyboardHeight, focused, scrollTo])

  return {
    scrollRef,
    keyboardVisible,
    fieldLayout: (index) => (event) => {
      positions.current[index] = event.nativeEvent.layout.y
    },
    fieldFocus: (index) => {
      scrollTo(index)
      setFocused(index)
    }
  }
}

export default useFocusScroll
