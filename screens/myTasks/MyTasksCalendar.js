// MyTasksCalendar.js
// My Tasks, CALENDAR tab: the month with the user's scheduled tasks, under the same hero and tabs as the
// lists. Loads while it is shown.
import React from "react"
import { View, Dimensions, ScrollView, Platform, StyleSheet } from "react-native"
import { useIsFocused } from "@react-navigation/native"

import MyTasksTopPart from "../../components/myTasks/MyTasksTopPart"
import CustomCalendar from "../../components/myTasks/CustomCalendar"
import { useMyTasksCalendar } from "../../hooks/queries/useMyTasks"
import useAuthStore from "../../stores/authStore"
import styles from "../../styles/MyTasks.style.js"
import { palette } from "../../styles/palette"
import { myTasksRoute } from "./myTasksTabs"

export default function MyTasksCalendar({ navigation }) {
  const isFocused = useIsFocused()
  const userSelect = useAuthStore((state) => state.userSelect)
  const calendar = useMyTasksCalendar(isFocused)

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ ...styles.containerStyle, minHeight: Dimensions.get("screen").height, backgroundColor: palette.white }}
      bounces={false}
    >
      <View style={local.content}>
        <MyTasksTopPart userSelect={userSelect} screen="CALENDAR" setScreen={(key) => navigation.navigate(myTasksRoute(key))} />
        <View style={[local.calendar, Platform.OS === "ios" ? { minHeight: Dimensions.get("screen").height - 200 } : null]}>
          <CustomCalendar loadingCal={calendar.isFetching} calendar={calendar.data || []} userSelect={userSelect} />
        </View>
      </View>
    </ScrollView>
  )
}

// this file's own styles (the shared ones are in `styles`)
const local = StyleSheet.create({
  content: { zIndex: 2, backgroundColor: palette.white },
  calendar: { marginBottom: 0, backgroundColor: palette.white }
})
