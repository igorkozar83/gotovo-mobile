// calendarLocale.js
// The calendar's month and day names in the app's language (react-native-calendars reads them from
// LocaleConfig).
import { LocaleConfig } from "react-native-calendars"

import { translate } from "./language.utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const CALENDAR_LOCALE = { CZ: "cz", EN: "en", SR: "sr" }

export const applyCalendarLocale = (language) => {
  const months = MONTHS.map((month) => translate(month))
  const days = DAYS.map((day) => translate(day))
  Object.values(CALENDAR_LOCALE).forEach((locale) => {
    LocaleConfig.locales[locale] = {
      monthNames: months,
      monthNamesShort: months,
      dayNames: days,
      dayNamesShort: days,
      today: locale === "en" ? "Today" : translate("calendarLocale.today")
    }
  })
  if (CALENDAR_LOCALE[language]) LocaleConfig.defaultLocale = CALENDAR_LOCALE[language]
}
