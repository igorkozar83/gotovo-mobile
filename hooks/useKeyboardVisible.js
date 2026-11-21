// useKeyboardVisible.js
// Whether the keyboard is up: on iOS from the moment it starts to show, on Android once it has shown.
import { useEffect, useState } from "react"
import { Keyboard, Platform } from "react-native"

const useKeyboardVisible = () => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setVisible(true))
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setVisible(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])
  return visible
}

export default useKeyboardVisible
