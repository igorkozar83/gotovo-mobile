// calendarTheme.js
// The look of the date picker's calendar (react-native-calendars theme).
import { palette } from "../../styles/palette"

const header = { color: palette.black, fontFamily: "Montserrat_300Light" }
const weekendHeader = { color: palette.black, fontWeight: "bold", fontFamily: "Montserrat_700Bold" }

export const CALENDAR_THEME = {
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
  monthTextColor: palette.blueSoft,
  indicatorColor: palette.black,
  textDayFontFamily: "Montserrat_300Light",
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
    dayTextAtIndex0: header,
    dayTextAtIndex1: header,
    dayTextAtIndex2: header,
    dayTextAtIndex3: header,
    dayTextAtIndex4: header,
    dayTextAtIndex5: weekendHeader,
    dayTextAtIndex6: weekendHeader
  }
}
