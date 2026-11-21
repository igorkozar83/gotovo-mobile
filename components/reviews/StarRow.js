// StarRow.js
// Five stars, the first `value` of them orange. With onRate each star can be tapped to rate; without it
// the row is one picture a screen reader names ("Rating: 4/5").
import React from "react"
import { View, Pressable, StyleSheet } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { palette } from "../../styles/palette"
import { translate } from "../../Helpers/language.utils"
import { HIT_SLOP_ROW } from "../../Helpers/accessibility"

const STARS = [1, 2, 3, 4, 5]

const StarRow = ({ value, onRate, size = 44, emptyColor = palette.gray100, spacing = 5, style }) => (
  <View style={[styles.row, style]} {...(onRate ? {} : { accessible: true, accessibilityRole: "image", accessibilityLabel: `${translate("starRow.rating")}: ${value || 0}/5` })}>
    {STARS.map((stars) => {
      const star = <FontAwesome name="star" size={size} color={value >= stars ? palette.orange : emptyColor} style={{ marginRight: spacing }} />
      return onRate ? (
        <Pressable accessibilityRole="button" accessibilityLabel={translate("starRow.rate") + " " + stars} hitSlop={HIT_SLOP_ROW} key={stars} onPress={() => onRate(stars)}>
          {star}
        </Pressable>
      ) : (
        <View key={stars}>{star}</View>
      )
    })}
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" }
})

export default StarRow
