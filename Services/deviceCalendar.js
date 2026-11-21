// deviceCalendar.js
// Adds events to the phone's calendar (expo-calendar), in a calendar of the app's own.
import { Platform } from "react-native"
import * as Calendar from "expo-calendar"

// the title of the calendar earlier versions created; kept so their calendar is reused instead of duplicated
const CALENDAR_TITLE = "Expo Calendar"

// the app's calendar: found by its title, created the first time
const appCalendarId = async () => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
  const existing = calendars.find((calendar) => calendar.title === CALENDAR_TITLE && calendar.allowsModifications)
  if (existing) return existing.id

  const source = Platform.OS === "ios" ? (await Calendar.getDefaultCalendarAsync()).source : { isLocalAccount: true, name: CALENDAR_TITLE }
  return Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: "blue",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: source.id,
    source,
    name: "internalCalendarName",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER
  })
}

/**
 * Adds an event with a reminder 10 minutes before it.
 * Resolves to false when the calendar permission was not granted; throws when the event could not be saved.
 */
export const addCalendarEvent = async ({ title, notes, startDate, endDate }) => {
  const { status } = await Calendar.requestCalendarPermissionsAsync()
  if (status !== "granted") return false

  await Calendar.createEventAsync(await appCalendarId(), {
    title,
    notes,
    startDate,
    endDate,
    alarms: [{ relativeOffset: -10, method: Calendar.AlarmMethod.DEFAULT }]
  })
  return true
}
