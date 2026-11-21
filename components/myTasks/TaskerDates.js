// TaskerDates.js
// The client's proposed dates (a tasker picks one) or, once one is accepted, the scheduled date.
import React from "react"
import { Text, StyleSheet } from "react-native"

import { DateRow, DateRadio, spokenTime } from "../taskDetails/DateChoice"
import { translate } from "../../Helpers/language.utils"

const TaskerDates = ({ task, acceptedTime, isTasker, selectedDate, selectedDateInit, selectable, onSelect, colors, language }) => (
  <>
    <Text accessibilityRole="header" style={[styles.title, { color: colors.textColor }]}>
      {!acceptedTime ? translate("taskerDates.clientProposedDates") : translate("taskerDates.scheduledDate")}
    </Text>
    {!acceptedTime && isTasker
      ? task.times.map((time, index) => (
          <DateRow key={`task-details-times-proposed-list-${index}`} time={time} language={language}>
            <DateRadio
              accessibilityLabel={spokenTime(time, language)}
              selected={(selectedDate && selectedDate.id === time.id) || (selectedDateInit && selectedDateInit.id === time.id)}
              onPress={selectable ? () => onSelect(time) : null}
              color={colors.bgColor}
            />
          </DateRow>
        ))
      : null}
    {acceptedTime ? <DateRow time={acceptedTime} language={language} /> : null}
  </>
)

const styles = StyleSheet.create({
  title: { fontFamily: "Montserrat_700Bold", fontSize: 12, marginBottom: 10 }
})

export default TaskerDates
