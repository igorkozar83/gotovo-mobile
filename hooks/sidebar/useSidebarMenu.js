// useSidebarMenu.js
// The side menu's slide-in / slide-out and the backdrop fade, driven by uiStore.openMenuContext (the
// header keeps its own flag in step). While it slides out the menu stays drawn.
import { useLayoutEffect, useRef, useState } from "react"
import { Animated, Dimensions, Easing } from "react-native"

import useUiStore from "../../stores/uiStore"

const slide = (value, toValue, done) => Animated.timing(value, { toValue, delay: 0, duration: 250, easing: Easing.linear, useNativeDriver: true }).start(done)
const fade = (value, toValue) => Animated.timing(value, { toValue, duration: 500, useNativeDriver: true }).start()

const useSidebarMenu = () => {
  const open = useUiStore((state) => state.openMenuContext)
  const setOpen = useUiStore((state) => state.setOpenMenuContext)
  const setHeaderMenuOpen = useUiStore((state) => state.setHeaderMenuOpen)

  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    setHeaderMenuOpen(open)
    if (open) {
      slide(translateX, -((Dimensions.get("screen").width * 69) / 100))
      setShown(true)
      fade(opacity, 1)
    } else {
      slide(translateX, 20, () => setShown(false))
      fade(opacity, 0)
    }
  }, [open, opacity, setHeaderMenuOpen, translateX])

  return { shown, translateX, opacity, close: () => setOpen(false), toggle: () => setOpen((current) => !current) }
}

export default useSidebarMenu
