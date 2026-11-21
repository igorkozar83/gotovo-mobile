// Button.js
// The app's full-width button: centred (translated) text in the role's color, with an optional small
// icon (children) on its right.
import React from "react"
import { Text, Pressable, Dimensions, StyleSheet } from "react-native"

import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const FONT_SIZE = Dimensions.get("screen").width < 380 ? 16 : 18

/**
 * title: a translation key; onPress; background / textColor: other colors than the role's
 * iconSize { width, height } / iconTop: the icon's box and how far down it sits
 * buttonStyle / textStyle: the rare differences (a lower button, a fixed line height)
 */
const Button = ({ onPress, background, title, textColor, children, iconSize, iconTop, buttonStyle, textStyle }) => {
  const colors = useRoleColors()
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.tableDarkerBg, borderless: false }}
      style={[styles.button, { backgroundColor: background ?? colors.bgColor }, buttonStyle]}
    >
      <Text style={[styles.text, { color: textColor || palette.white }, textStyle]}>{translate(title)}</Text>
      <Text style={[styles.icon, { width: iconSize?.width || 20, height: iconSize?.height || 22, top: iconTop ?? "40%" }]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { borderRadius: 5, paddingVertical: 10, paddingBottom: 8, elevation: 2, flexDirection: "row", alignItems: "center", width: "100%", minHeight: 42 },
  text: { width: "100%", textAlign: "center", textAlignVertical: "center", fontSize: FONT_SIZE, fontFamily: "Montserrat_500Medium" },
  icon: { position: "absolute", right: 15 }
})

export default Button
