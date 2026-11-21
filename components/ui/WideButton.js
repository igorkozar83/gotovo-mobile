// WideButton.js
// The full-width coloured button of the task screens: centred text with a small picture on its right.
import React from "react"
import { Text, Pressable, Dimensions, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { palette } from "../../styles/palette"

const small = Dimensions.get("screen").width < 380

/**
 * color: the background; icon + iconStyle: the picture and its size
 * style / textStyle: the button's and the text's differences (spacing, a fixed font size)
 */
const WideButton = ({ text, onPress, color = palette.gray600, icon, iconStyle, style, textStyle }) => (
  <Pressable onPress={onPress} style={[styles.button, { backgroundColor: color }, style]}>
    <Text style={[styles.text, textStyle]}>{text}</Text>
    {icon ? <FastImageComponent source={icon} style={[styles.icon, iconStyle]} /> : null}
  </Pressable>
)

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingVertical: 5,
    marginBottom: 10,
    borderRadius: 5
  },
  text: { width: "70%", fontSize: small ? 16 : 18, fontFamily: "Montserrat_500Medium", lineHeight: 30, textAlign: "center", color: palette.white },
  icon: { position: "absolute", right: 20 }
})

export default WideButton
