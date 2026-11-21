// useCollapsingHeader.js
// The chat header slides away as the messages scroll up and comes back as they scroll down; with the
// keyboard shown it starts lower.
import { useRef } from "react"
import { Animated, Platform } from "react-native"

export const HEADER_HEIGHT = 320

const useCollapsingHeader = (keyboard) => {
  const scrollY = useRef(new Animated.Value(0)).current
  const start = keyboard.shown ? (Platform.OS === "ios" ? keyboard.height - 300 : keyboard.height - 95) : 0
  const translateY = Animated.diffClamp(scrollY, -250, HEADER_HEIGHT).interpolate({
    inputRange: [start, HEADER_HEIGHT],
    outputRange: [start, -HEADER_HEIGHT],
    extrapolate: "clamp"
  })
  return { translateY, onScroll: (e) => scrollY.setValue(e.nativeEvent.contentOffset.y) }
}

export default useCollapsingHeader
