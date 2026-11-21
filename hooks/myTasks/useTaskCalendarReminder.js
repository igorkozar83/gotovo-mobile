// useTaskCalendarReminder.js
// Puts a task's confirmed time into the phone's calendar with a reminder. The alerts for a missing time,
// a refused permission and a failure are shown here; add() resolves to true once the event is saved.
import { useCallback } from "react"

import useAlert from "../useAlert"
import useUiStore from "../../stores/uiStore"
import { addCalendarEvent } from "../../Services/deviceCalendar"
import { toDate } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { reportError } from "../../Helpers/reportError"

const useTaskCalendarReminder = () => {
  const language = useUiStore((state) => state.language)
  const { showError } = useAlert()

  // taskName; time: { date, start, end }
  const add = useCallback(
    async (taskName, time) => {
      if (!time) {
        showError("useTaskCalendarReminder.addDateToCalendarError", "useTaskCalendarReminder.confirmedDateIsNotSet")
        return false
      }
      try {
        const saved = await addCalendarEvent({
          title: translate("useTaskCalendarReminder.taskIsScheduledForToday", { name: taskName }),
          notes: translate("useTaskCalendarReminder.reminderYouScheduledTheTaskFor", { name: taskName }),
          startDate: toDate(time.date + " " + time.start, language),
          endDate: toDate(time.date + " " + time.end, language)
        })
        if (!saved) showError("useTaskCalendarReminder.addDateToCalendarError", "useTaskCalendarReminder.inOrderToAddEventTo")
        return !!saved
      } catch (e) {
        reportError(e, "useTaskCalendarReminder")
        showError("useTaskCalendarReminder.addDateToCalendarError", "useTaskCalendarReminder.eventWasNotSavedToThe")
        return false
      }
    },
    [language, showError]
  )

  return add
}

export default useTaskCalendarReminder
