// SideScroller.js
// A sideways list (the category bars) with a shade and an arrow over its right end while there is more
// to see; the arrow scrolls on by 100. The caller wraps it in its own background.
import React, { useLayoutEffect, useRef, useState } from "react"
import { Pressable } from "react-native"
import { ScrollView as GestureHandlerScrollView, GestureHandlerRootView } from "react-native-gesture-handler"
import { LinearGradient } from "expo-linear-gradient"
import { AntDesign } from "@expo/vector-icons"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

/**
 * shadeColors / shadeWidth: the shade under the arrow; arrowColor / arrowZ: the arrow and its layer
 * nearEnd: how close to the end (px) counts as the end
 * resetKey: when it changes (and is not false) the arrow shows again
 */
const SideScroller = ({ children, shadeColors, shadeWidth, arrowColor, arrowZ = 5, nearEnd = 20, resetKey = false }) => {
  const scroll = useRef(null)
  const offset = useRef(0)
  const [moreRight, setMoreRight] = useState(true)

  useLayoutEffect(() => {
    if (resetKey !== false) setMoreRight(true)
  }, [resetKey])

  const atEnd = ({ layoutMeasurement, contentOffset, contentSize }) => layoutMeasurement.width + contentOffset.x >= contentSize.width - nearEnd

  return (
    <>
      {moreRight ? (
        <>
          <LinearGradient colors={shadeColors} style={{ position: "absolute", right: 0, width: shadeWidth, top: 0, bottom: 0, zIndex: 5 }} start={[0, 0]} end={[1, 0]} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={translate("sideScroller.scrollRight")}
            hitSlop={HIT_SLOP}
            onPress={() => scroll.current?.scrollTo({ x: offset.current + 100, animated: true })}
            style={{ position: "absolute", right: 0, top: "30%", zIndex: arrowZ }}
          >
            <AntDesign name="right" size={44} color={arrowColor} />
          </Pressable>
        </>
      ) : null}
      <GestureHandlerRootView style={atoms.flex1}>
        <GestureHandlerScrollView
          horizontal
          ref={scroll}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={10}
          onScroll={({ nativeEvent }) => {
            offset.current = nativeEvent.contentOffset.x
            setMoreRight(!atEnd(nativeEvent))
          }}
        >
          {children}
        </GestureHandlerScrollView>
      </GestureHandlerRootView>
    </>
  )
}

export default SideScroller
