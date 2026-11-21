// DateTimePicker.js
// A day (up to about a year ahead) and a from-to range of hours, in a modal. The picked time goes to
// onPick(["YYYY-MM-DD H:00", "YYYY-MM-DD H:00"]) and the modal closes; what it is used for is the
// caller's business. markedDates ([[from, to], ...]) marks the days that already have a time.
import React, { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Calendar } from "react-native-calendars"
import { Feather } from "@expo/vector-icons"

import Button from "../ui/Button"
import FastImageComponent from "../media/FastImageComponent"
import DayCell from "./DayCell"
import HourSpinner from "./HourSpinner"
import { CALENDAR_THEME } from "./calendarTheme"
import useHourRange from "../../hooks/useHourRange"
import useCalendarLocale from "../../hooks/useCalendarLocale"
import { getDate } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import ModalFrame, { CloseX } from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// the device's day (an ISO string is UTC: after midnight in Serbia it is still yesterday there)
const today = () => getDate()
const inAYear = () => getDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))

const DateTimePicker = ({ visible, onClose, onPick, markedDates = [] }) => {
  useCalendarLocale()

  const [day, setDay] = useState(today)
  const hours = useHourRange(day)
  const markedDays = markedDates.map((pair) => pair[0].split(" ")[0])

  const pick = () => {
    onPick([day + " " + hours.from + ":00", day + " " + hours.to + ":00"])
    onClose()
  }

  return (
    <ModalFrame visible={visible} onRequestClose={onClose} animationType="fade" shadow="soft" blur>
      <View style={styles.modalIn}>
        <CloseX onPress={onClose} color={palette.blue} style={styles.closeBtn} />
        <Text accessibilityRole="header" style={styles.modalTitle}>
          {translate("dateTimePicker.pickDateAndTime")}
        </Text>
        <View style={styles.calLine}></View>
        <Calendar
          minDate={getDate()}
          maxDate={inAYear()}
          onDayPress={(date) => setDay(date.dateString)}
          current={day}
          hideExtraDays
          monthFormat={"MMMM"}
          firstDay={1}
          renderArrow={(direction) => (
            <FastImageComponent style={styles.arrowsCal} source={direction === "left" ? require("../../assets/arrcalleft.png") : require("../../assets/arrcalright.png")} />
          )}
          dayComponent={({ date, onPress }) => <DayCell date={date} onPress={onPress} marked={markedDays.includes(date.dateString)} selected={day === date.dateString} />}
          theme={CALENDAR_THEME}
        />
        <View style={styles.times}>
          <HourSpinner label={"dateTimePicker.from"} hour={hours.from} onStep={hours.stepFrom} unitStyle={atoms.marginLeft0} />
          <HourSpinner label={"dateTimePicker.to"} hour={hours.to} onStep={hours.stepTo} labelStyle={atoms.marginLeft6} unitStyle={atoms.marginLeft4} />
        </View>
        <View style={atoms.marginTop20}>
          <Button onPress={pick} title={"common.ok"}>
            <Feather style={styles.okButtonImg} name="check" size={18} color={palette.white} />
          </Button>
        </View>
      </View>
    </ModalFrame>
  )
}

const styles = StyleSheet.create({
  okButtonImg: { height: 13, width: 50, position: "absolute", right: 0 },
  times: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalIn: { padding: 20, width: "100%", borderRadius: 20 },
  closeBtn: { right: 15, top: 15, width: 30, height: 30, zIndex: 5 },
  modalTitle: { marginTop: 20, fontSize: 22, fontFamily: "Montserrat_500Medium", color: palette.blue, marginBottom: 14, textAlign: "center" },
  arrowsCal: { width: 9, height: 18 },
  calLine: { borderBottomColor: palette.white, borderBottomWidth: 1, top: 90, marginHorizontal: 12, height: 1 }
})

export default DateTimePicker
