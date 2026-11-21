// QuestionMark.js
// The small round "?" of help texts, in the role's accent colour.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import useRoleColors from "../../hooks/useRoleColors"
import { palette } from "../../styles/palette"

const QuestionMark = () => {
  const colors = useRoleColors()
  return (
    <View style={[styles.circle, { backgroundColor: colors.accent }]}>
      <Text style={styles.mark}>?</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: { width: 18, height: 18, borderRadius: 36, justifyContent: "center", alignItems: "center" },
  mark: { color: palette.white, fontSize: 12, position: "relative", top: -1 }
})

export default QuestionMark
