// useChatKeyboard.js
// The keyboard as the chat layout needs it: `open` (about to show; iOS only), `shown` (has finished
// showing) and its height. onShown runs each time it has shown.
import { useEffect, useRef, useState } from "react"
import { Keyboard } from "react-native"

const useChatKeyboard = (onShown) => {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false)
  const [height, setHeight] = useState(160)
  const onShownRef = useRef(onShown)
  onShownRef.current = onShown

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener("keyboardWillShow", () => setOpen(true)),
      Keyboard.addListener("keyboardWillHide", () => setOpen(false)),
      Keyboard.addListener("keyboardDidShow", (e) => {
        setHeight(e.endCoordinates.height)
        setShown(true)
        onShownRef.current()
      }),
      Keyboard.addListener("keyboardDidHide", () => setShown(false))
    ]
    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [])

  return { open, shown, height }
}

export default useChatKeyboard
