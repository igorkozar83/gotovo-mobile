// OrDivider.js
// "— OR LOGIN USING —" above the social login buttons.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const OrDivider = () => (
  <View style={styles.row}>
    <View style={[styles.line, styles.lineLeft]} />
    <Text style={styles.text}>{translate("orDivider.orLoginUsing")}</Text>
    <View style={[styles.line, styles.lineRight]} />
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: palette.white },
  lineLeft: { marginRight: 10 },
  lineRight: { marginLeft: 10 },
  text: { fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: palette.white, textAlign: "center" }
})

export default OrDivider
