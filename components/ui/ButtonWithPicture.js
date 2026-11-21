// ButtonWithPicture.js
// The buttons of the task modals: a coloured bar with its text centred (shrunk to fit one line) and a
// small picture on the right.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"

import FastImageComponent from "../media/FastImageComponent"
import { palette } from "../../styles/palette"

const ICON_GAP = 8
const FONT_SIZE = Dimensions.get("screen").width < 380 ? 16 : 18

/**
 * icon + widthPicture / heightPicture: the picture and its size
 * textSize / fontFamily / textColor / backgroundColor / marginBottom: the rare differences
 */
const ButtonWithPicture = ({
  text,
  textColor = palette.white,
  icon,
  backgroundColor = palette.orangeDeep,
  onPress = () => {},
  widthPicture = 18,
  heightPicture = 18,
  textSize,
  marginBottom = 10,
  fontFamily
}) => (
  <Pressable onPress={onPress} style={[styles.button, { backgroundColor, marginBottom }]}>
    {/* as wide as the picture, so the text stays centred */}
    <View style={{ width: widthPicture + ICON_GAP }} />
    <Text style={[styles.text, { fontSize: textSize || FONT_SIZE, fontFamily: fontFamily || "Montserrat_500Medium", color: textColor }]} adjustsFontSizeToFit numberOfLines={1}>
      {text}
    </Text>
    {/* (contain: a picture that is not square, the check, is never cut to the square box) */}
    <FastImageComponent contentFit="contain" source={icon} style={{ width: widthPicture, height: heightPicture, marginRight: 10, marginLeft: ICON_GAP }} />
  </Pressable>
)

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    marginTop: 5,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10
  },
  text: { flex: 1, textAlign: "center" }
})

export default ButtonWithPicture
