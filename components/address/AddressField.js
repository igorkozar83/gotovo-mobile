// AddressField.js
// A labelled grey input of the address form.
import React from "react"
import { View, Text, TextInput, Platform, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

const AddressField = ({ label, required, style, inputStyle, ...input }) => (
  <View style={style}>
    <Text style={styles.label}>
      {translate(label)}
      {required ? " *" : ""}
    </Text>
    <TextInput accessibilityLabel={spokenLabel(label)} style={[styles.input, inputStyle]} blurOnSubmit autoCapitalize="none" autoCorrect={false} {...input} />
  </View>
)

export const labelStyle = { fontSize: 10, fontFamily: "Montserrat_400Regular" }

const styles = StyleSheet.create({
  label: labelStyle,
  input: { backgroundColor: palette.gray100, padding: 10, paddingLeft: 5, fontSize: 16, height: Platform.OS === "ios" ? 44 : 40, fontFamily: "Montserrat_500Medium" }
})

export default AddressField
