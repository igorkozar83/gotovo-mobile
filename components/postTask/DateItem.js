// DateItem.js
// One preferred time in the task form: its day and hours, with remove and edit buttons.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SimpleLineIcons } from "@expo/vector-icons"

import { RemoveButton, EditButton } from "../ui/RoundIconButton"
import { dateDotThreeMonth, hourMin } from "../../Helpers"
import { palette } from "../../styles/palette"

// date: [from, to]
const DateItem = ({ date, language, onRemove, onEdit }) => (
  <View style={styles.row}>
    <SimpleLineIcons name="calendar" size={18} color={palette.black} />
    <Text style={styles.text}>{dateDotThreeMonth(date[0], language)}</Text>
    <SimpleLineIcons name="clock" size={18} color={palette.black} />
    <Text style={styles.text}>
      {hourMin(date[0])} - {hourMin(date[1])}
    </Text>
    <View style={styles.actions}>
      <RemoveButton small onPress={onRemove} />
      <EditButton small onPress={onEdit} />
    </View>
  </View>
)

const styles = StyleSheet.create({
  actions: { flexDirection: "row", marginLeft: "auto" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginHorizontal: 22, justifyContent: "space-between" },
  text: { fontSize: 18, fontFamily: "Montserrat_600SemiBold", marginLeft: 5, marginRight: "auto" }
})

export default DateItem
