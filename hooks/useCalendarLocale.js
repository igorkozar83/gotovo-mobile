// useCalendarLocale.js
// Keeps the calendars' month and day names in the app's language (see Helpers/calendarLocale), also
// after the translations were reloaded.
import { useMemo } from "react"

import useUiStore from "../stores/uiStore"
import { applyCalendarLocale } from "../Helpers/calendarLocale"

const useCalendarLocale = () => {
  const language = useUiStore((state) => state.language)
  const textsVersion = useUiStore((state) => state.textsVersion)
  // set before the calendar renders; textsVersion: the translations changed, so the names did too
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => applyCalendarLocale(language), [language, textsVersion])
}

export default useCalendarLocale
