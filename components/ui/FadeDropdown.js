// FadeDropdown.js
// A button that fades a panel (the children) in under it and out again. Bumping `close` closes it.
import React, { useEffect, useRef, useState } from "react"
import { View, Text, Pressable, Animated, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const fade = (value, toValue, done) => Animated.timing(value, { toValue, duration: 500, useNativeDriver: true }).start(done)

/**
 * title: the button's text (translated); look: { background, openBackground, textStyle, chevron }
 * buttonStyle / panelStyle: the button's and the panel's place and size
 */
const FadeDropdown = ({ title, close, look, buttonStyle, panelStyle, style, children }) => {
  const [open, setOpen] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setOpen(false)
  }, [close])

  const toggle = () => {
    if (open) return fade(opacity, 0, () => setOpen(false))
    setOpen(true)
    fade(opacity, 1)
  }

  const background = open ? look.openBackground : look.background
  return (
    <View style={style}>
      <Pressable android_ripple={{ color: background, borderless: false }} style={[styles.button, buttonStyle, { backgroundColor: background }]} onPress={toggle}>
        <Text style={[styles.text, look.textStyle]}>{translate(title)}</Text>
        <Text style={styles.chevron}>
          <AntDesign name="down" size={look.chevronSize || 18} color={look.chevron} />
        </Text>
      </Pressable>
      {open ? <Animated.View style={[styles.panel, panelStyle, { opacity }]}>{children}</Animated.View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  button: { elevation: 2, flexDirection: "row", alignItems: "center", height: 40, marginTop: 10, borderRadius: 5 },
  text: { width: "100%", paddingLeft: 10, textAlignVertical: "center", fontSize: 16, fontFamily: "Montserrat_500Medium" },
  chevron: { width: 25, height: 25, position: "absolute", right: 10, top: "50%", transform: [{ translateY: -8 }] },
  panel: {
    zIndex: 100,
    position: "absolute",
    top: 50,
    backgroundColor: palette.gray100,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 100
  }
})

export default FadeDropdown
