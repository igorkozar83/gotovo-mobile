// SheetParts.js
// The parts of a form modal: its icon, its title, "LABEL: value" facts about what the form is for, the
// white line between its parts, and its full-width buttons.
import React from "react"
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native"

import AutoImage from "../media/AutoImage"
import FastImageComponent from "../media/FastImageComponent"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

export const SheetIcon = ({ source, style }) => (
  <View style={[styles.iconBlock, style]}>
    <AutoImage source={source} style={styles.logo} />
  </View>
)

export const SheetTitle = ({ children, style }) => (
  <Text accessibilityRole="header" style={[styles.title, style]}>
    {translate(children)}
  </Text>
)

export const Fact = ({ label, children, textStyle, textProps }) => (
  <View style={atoms.marginBottom10}>
    <Text style={styles.factLabel}>{translate(label)}</Text>
    <Text style={[styles.fact, textStyle]} {...textProps}>
      {children}
    </Text>
  </View>
)

// the white line across a form modal: thin (1) or thick (2), with `gap` above and below
export const SheetDivider = ({ thick, gap = 17 }) => <View style={[thick ? styles.thick : styles.thin, { marginVertical: gap }]} />

const small = Dimensions.get("screen").width < 380

// a full-width button of a form modal: the text (a translation key) centred, a small picture on the right
export const SheetButton = ({ text, onPress, color = palette.white, textColor = palette.blueDark, icon, iconStyle, style }) => (
  <Pressable onPress={onPress} android_ripple={{ color: palette.white, borderless: false }} style={[styles.button, { backgroundColor: color }, style]}>
    <Text style={[styles.buttonText, { color: textColor }]}>{translate(text)}</Text>
    {icon ? <FastImageComponent source={icon} style={[styles.buttonIcon, iconStyle]} /> : null}
  </Pressable>
)

const styles = StyleSheet.create({
  logo: { maxHeight: 60, width: "100%" },
  factLabel: { fontSize: 10, color: palette.white },
  iconBlock: { justifyContent: "center", alignItems: "center", marginTop: 20, height: 80 },
  button: { borderRadius: 5, paddingVertical: 10, paddingBottom: 8, elevation: 2, flexDirection: "row", alignItems: "center", width: "100%", height: 40 },
  buttonText: { width: "100%", textAlign: "center", textAlignVertical: "center", lineHeight: small ? 16 : 18, fontSize: small ? 16 : 18, fontFamily: "Montserrat_500Medium" },
  buttonIcon: { position: "absolute", right: 15, width: 28, height: 18, top: 10 },
  title: { fontSize: 24, textAlign: "center", fontFamily: "Montserrat_500Medium", marginVertical: 20, color: palette.white },
  thin: { width: "100%", borderBottomWidth: 1, borderBottomColor: palette.white },
  thick: { width: "100%", height: 2, backgroundColor: palette.white },
  fact: { fontFamily: "Montserrat_600SemiBold", color: palette.white, fontSize: 20 }
})
