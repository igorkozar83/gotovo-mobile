// CountBadge.js
// An unread count on a tab (the bottom bar's inbox, the inbox's tabs): round for one digit, wider for more, so the
// whole number shows (up to "999+"). style: where it sits (absolute) and its colour.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import { palette } from "../../styles/palette"

// a large system font grows the number only so far, so the badge stays on its tab
const MAX_SCALE = 1.2

export const badgeCount = (count) => (count > 999 ? "999+" : String(count))

const CountBadge = ({ count, style }) => (
  <View style={[styles.badge, style]}>
    <Text numberOfLines={1} maxFontSizeMultiplier={MAX_SCALE} style={styles.text}>
      {badgeCount(count)}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.orange
  },
  text: { fontFamily: "Montserrat_700Bold", fontSize: 10, lineHeight: 16, color: palette.white, textAlign: "center" }
})

export default CountBadge
