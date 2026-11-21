// RatingStats.js
// A user's rating next to their name: the stars and "completed" on the left, the average and the task
// count in the middle, "out of 5" and "tasks" on the right.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import StarRow from "../reviews/StarRow"
import { translate, countWord } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// "1 zadatak", "3 zadatka", "55 zadataka" (English: "1 task", "55 tasks")
const TASK_FORMS = { one: "task", few: "tasks (2-4)", many: "tasks (5+)" }

/**
 * stars: the average (a number for the stars, `average` its text); count: finished tasks, the word in its form
 * compact: the smaller version of the public profile
 */
const RatingStats = ({ stars, average, count, compact }) => (
  <View style={styles.row}>
    <View style={{ marginRight: compact ? 5 : 10 }}>
      <StarRow value={stars} size={compact ? 13 : 16} style={styles.stars} />
      <View style={styles.completed}>
        <Text style={styles.completedText}>{translate("ratingStats.completed")}</Text>
        <Ionicons name="checkmark" size={18} color={palette.orange} />
      </View>
    </View>
    <View style={[atoms.marginRight10, compact && styles.raised]}>
      <Text style={[styles.value, compact && { fontSize: 14 }]}>{average}</Text>
      <Text style={[styles.value, compact && { fontSize: 14 }]}>{count}</Text>
    </View>
    <View style={compact && styles.raised}>
      <Text style={[styles.label, compact && { fontSize: 13 }]}>{translate("ratingStats.outOf5")}</Text>
      <Text style={[styles.label, compact && { fontSize: 13 }]}>{countWord(count, TASK_FORMS)}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  stars: { justifyContent: "flex-start" },
  completed: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  completedText: { fontSize: 10, fontFamily: "Montserrat_400Regular", marginRight: 3 },
  raised: { marginTop: -5 },
  value: { fontSize: 16, fontFamily: "Montserrat_600SemiBold" },
  label: { fontSize: 14, fontFamily: "Montserrat_400Regular" }
})

export default RatingStats
