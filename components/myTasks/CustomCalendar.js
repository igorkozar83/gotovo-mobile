// CustomCalendar.js
// The My Tasks calendar: a month with Monday first; days with tasks are dark and list the other party
// of each task with its state (scheduled, completed, canceled).
import React from "react"
import { View, Pressable, Text, StyleSheet } from "react-native"
import { Calendar } from "react-native-calendars"

import FastImageComponent from "../media/FastImageComponent"
import useCalendarLocale from "../../hooks/useCalendarLocale"
import { getDate, shortenString, shortenName } from "../../Helpers"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// a task in the calendar by its status (as My Tasks marks it): scheduled, started (by either side: in
// progress), claimed complete, completed, canceled, disputed; one still without an accepted offer has no date
const IN_PROGRESS = require("../../assets/icontaskinprogress.png")
const TASK_STATUS_ICONS = {
  1: require("../../assets/scheduledtask.png"),
  2: require("../../assets/completedtask.png"),
  3: require("../../assets/completion.png"),
  4: require("../../assets/canceledtask.png"),
  5: require("../../assets/disputediconmyasks.png"),
  8: IN_PROGRESS,
  9: IN_PROGRESS
}

const ARROWS = { left: require("../../assets/arrcalleft.png"), right: require("../../assets/arrcalright.png") }

const WEEKDAY = { color: palette.black, fontFamily: "Montserrat_300Light" }
const WEEKEND = { color: palette.orange, fontWeight: "bold", fontFamily: "Montserrat_700Bold" }
const DAY_CELL = { borderColor: palette.gray300, borderBottomWidth: 1, flex: 1, padding: 10, paddingTop: 0, marginTop: 0 }

const THEME = {
  backgroundColor: palette.white,
  calendarBackground: palette.white,
  textSectionTitleColor: palette.ink,
  textSectionTitleDisabledColor: palette.gray250,
  selectedDayBackgroundColor: palette.black,
  selectedDayTextColor: palette.white,
  todayTextColor: palette.cyan,
  dayTextColor: palette.black,
  textDisabledColor: palette.gray250,
  dotColor: palette.cyan,
  selectedDotColor: palette.black,
  arrowColor: palette.amber,
  disabledArrowColor: palette.gray250,
  monthTextColor: palette.black,
  indicatorColor: palette.black,
  textDayFontFamily: "Montserrat_700Bold",
  textMonthFontFamily: "Montserrat_600SemiBold",
  textDayHeaderFontFamily: "Montserrat_600SemiBold",
  textDayFontWeight: "300",
  textMonthFontWeight: "bold",
  textDayHeaderFontWeight: "300",
  textDayFontSize: 14,
  textMonthFontSize: 14,
  textDayHeaderFontSize: 16,
  // the week starts on Monday: indexes 5 and 6 are the weekend
  "stylesheet.calendar.header": {
    dayTextAtIndex0: WEEKDAY,
    dayTextAtIndex1: WEEKDAY,
    dayTextAtIndex2: WEEKDAY,
    dayTextAtIndex3: WEEKDAY,
    dayTextAtIndex4: WEEKDAY,
    dayTextAtIndex5: WEEKEND,
    dayTextAtIndex6: WEEKEND,
    week: {
      marginTop: 0,
      marginBottom: 5,
      flexDirection: "row",
      justifyContent: "space-around",
      borderColor: palette.gray300,
      borderBottomWidth: 1,
      paddingBottom: 10,
      color: palette.orange
    }
  },
  "stylesheet.calendar.main": { dayContainer: DAY_CELL, emptyDayContainer: DAY_CELL }
}

const renderArrow = (direction) => <FastImageComponent style={{ height: 22, aspectRatio: 29 / 53 }} source={ARROWS[direction === "left" ? "left" : "right"]} />

// calendar: the entries from /api/calendar; loadingCal: they are loading
const CustomCalendar = ({ loadingCal, calendar, userSelect }) => {
  useCalendarLocale()

  const entriesOn = (date) => calendar.filter((entry) => getDate(entry.date) === date.dateString)

  const dayComponent = ({ date }) => {
    const entries = entriesOn(date)
    return (
      <View>
        <Pressable>
          <View>
            <Text style={{ fontFamily: "Montserrat_600SemiBold", color: entries.length ? palette.black : palette.gray350 }}>{date.day}</Text>
          </View>
        </Pressable>
        <View style={atoms.minHeight50}>
          {entries.map((entry, index) => {
            const icon = TASK_STATUS_ICONS[entry.task.status]
            if (!icon) return null
            const other = userSelect === "CLIENT" ? entry.task.accepted_by_user : entry.task.posted_by_user
            return (
              <View key={`render-days-cal-${index}`} style={styles.entry}>
                <FastImageComponent style={styles.entryIcon} source={icon} />
                <Text style={styles.entryText}>{shortenString(shortenName(other.full_name), 10)}</Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return <Calendar displayLoadingIndicator={loadingCal} hideExtraDays monthFormat={"MMMM"} firstDay={1} renderArrow={renderArrow} dayComponent={dayComponent} theme={THEME} />
}

const styles = StyleSheet.create({
  entryIcon: { width: 10, height: 10 },
  entryText: { fontSize: 8, marginLeft: 3 },
  entry: { flexDirection: "row", alignItems: "center", marginBottom: 3 }
})

export default CustomCalendar
