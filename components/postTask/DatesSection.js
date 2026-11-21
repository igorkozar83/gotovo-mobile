// DatesSection.js
// The task's preferred times (up to 3, each edited or removed) and whether the dates are flexible.
import React, { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Controller, useWatch } from "react-hook-form"

import TitleWithBorder from "../ui/TitleWithBorder"
import { ToggleBox } from "../ui/ChoiceControls"
import DateTimePicker from "../dateTime/DateTimePicker"
import ButtonWithIcon from "../ui/ButtonWithIcon"
import DateItem from "./DateItem"
import PostTaskTip from "./PostTaskTip"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

const MAX_DATES = 3

const DatesSection = ({ control, setValue }) => {
  const dates = useWatch({ control, name: "dates" })
  const language = useUiStore((state) => state.language)
  const [picker, setPicker] = useState(false)
  const [mode, setMode] = useState("add") // "add" or the index of the date being edited

  const setDates = (next) => setValue("dates", next)

  return (
    <>
      <View style={styles.title}>
        <TitleWithBorder title={translate("datesSection.preferedTime")}>
          <PostTaskTip textKey="Tooltip 1 (prefered time - POST A TASK)" />
        </TitleWithBorder>
      </View>
      {dates.map((date, index) => (
        <DateItem
          key={`datettime-tasks-list-${index}`}
          date={date}
          language={language}
          onRemove={() => setDates(dates.filter((_, i) => i !== index))}
          onEdit={() => {
            setMode(index)
            setPicker(true)
          }}
        />
      ))}
      {dates.length < MAX_DATES ? (
        <View style={styles.dates}>
          <ButtonWithIcon
            text={translate("datesSection.chooseDates")}
            onPress={() => {
              setMode("add")
              setPicker(true)
            }}
            iconSource={require("../../assets/iconaltdates.png")}
          />
        </View>
      ) : null}
      <View style={styles.flexibleRow}>
        <Text style={styles.flexibleText}>{translate("datesSection.myDatesAreFlexible")}</Text>
        <Controller
          control={control}
          name="flexibleDates"
          render={({ field: { value, onChange } }) => <ToggleBox accessibilityLabel={spokenLabel("datesSection.myDatesAreFlexible")} checked={value} onChange={onChange} />}
        />
      </View>
      <DateTimePicker
        visible={picker}
        onClose={() => setPicker(false)}
        markedDates={dates}
        onPick={(picked) => setDates(mode === "add" ? [...dates, picked] : dates.map((date, index) => (index === mode ? picked : date)))}
      />
    </>
  )
}

const styles = StyleSheet.create({
  dates: { marginHorizontal: 22, marginVertical: 20 },
  title: { paddingHorizontal: 22, marginTop: 32, marginBottom: 20 },
  flexibleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 22 },
  flexibleText: { color: palette.black, fontSize: 18, fontFamily: "Montserrat_500Medium" }
})

export default DatesSection
