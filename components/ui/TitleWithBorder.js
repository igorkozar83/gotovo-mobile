// TitleWithBorder.js
// A section title of the forms and details: centred, in the role's color, over a line of the same
// color; children sit on its right (a question mark, an edit link).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"

const TitleWithBorder = ({ title, children }) => {
  const { textColor } = useRoleColors()
  return (
    <View style={{ width: "100%", borderBottomColor: textColor, borderBottomWidth: 2, position: "relative" }}>
      {/* (with something on its right, a long title wraps short of it, on both sides so it stays centred) */}
      <Text accessibilityRole="header" style={[styles.title, { color: textColor }, children ? styles.titleBesideSide : null]}>
        {translate(title)}
      </Text>
      <View style={styles.side}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  title: { textAlign: "center", marginBottom: 5, fontFamily: "Montserrat_600SemiBold", fontSize: 16 },
  titleBesideSide: { paddingHorizontal: 26 },
  side: { position: "absolute", right: 0, top: 5 }
})

export default TitleWithBorder
