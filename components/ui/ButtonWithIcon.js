// ButtonWithIcon.js
// A grey full-width button with its text centred and a small picture on the right.
// buttonStyle replaces the button's look (not merged); iconStyle adds to the icon's.
import React from "react"
import { Pressable, Text, StyleSheet, Dimensions, Image } from "react-native"
import { palette } from "../../styles/palette"

const ButtonWithIcon = ({ text, onPress, iconSource, buttonStyle, iconStyle }) => {
  return (
    <Pressable onPress={onPress} style={buttonStyle || styles.button}>
      <Text style={styles.text}>{text}</Text>
      <Image source={iconSource} style={[styles.icon, iconStyle]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    elevation: 2,
    backgroundColor: palette.gray600,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 42,
    justifyContent: "center",
    position: "relative"
  },
  text: {
    color: palette.white,
    textAlign: "center",
    fontSize: Dimensions.get("screen").width < 380 ? 16 : 18,
    fontFamily: "Montserrat_500Medium"
  },
  icon: {
    width: 18,
    height: 17,
    position: "absolute",
    right: 16
  }
})

export default ButtonWithIcon
