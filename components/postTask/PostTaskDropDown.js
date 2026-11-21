// PostTaskDropDown.js
// The post-task form's dropdown (a blue button, or a silver one) over the options panel (children).
import React from "react"
import { Dimensions, StyleSheet } from "react-native"

import FadeDropdown from "../ui/FadeDropdown"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const small = Dimensions.get("screen").width < 380

const LOOKS = {
  blue: {
    background: palette.blueDark,
    openBackground: palette.gray600,
    chevron: palette.white,
    textStyle: { color: palette.white, fontSize: small ? 12 : 15, textTransform: "uppercase" }
  },
  silver: { background: palette.gray350, openBackground: palette.gray650, chevron: "black", textStyle: { color: palette.black } }
}

// title: the button's text; silver: the silver look; close: bump to close
const PostTaskDropDown = ({ children, title, silver, close }) => (
  <FadeDropdown
    title={title}
    close={close}
    look={silver === true ? LOOKS.silver : LOOKS.blue}
    style={styles.dropdown}
    buttonStyle={atoms.marginHorizontal22}
    panelStyle={{ marginHorizontal: 22, width: Dimensions.get("window").width - 44 }}
  >
    {children}
  </FadeDropdown>
)

const styles = StyleSheet.create({
  dropdown: { zIndex: 100 }
})

export default PostTaskDropDown
