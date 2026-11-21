// notifications.js
// A stored notification's text in the app's language. The server writes the text with the task name,
// question or time filled in; those are swapped for placeholders (the translation keys have them),
// translated, and put back.
import { translate } from "./language.utils"

// the names the placeholders stand for, as the notification's data carries them
const taskNameOf = (notification, data) =>
  notification.taskName || data.taskName || (data.task && data.task.taskName) || data.task_name || (data.task && data.task.task && data.task.task.name) || null

const questionOf = (data) => data.taskQuestion || (data.type === "answer-task-question" && data.question) || null

// the notification's body translated; data is its parsed data
export const notificationText = (notification, data) => {
  const values = {
    "!!taskName!!": taskNameOf(notification, data),
    "!!taskQuestion!!": questionOf(data),
    "!!timeSet!!": data.type === "task-time-accepted" ? data.time : null
  }

  let body = notification.body || ""
  Object.entries(values).forEach(([placeholder, value]) => {
    if (value) body = body.split(value).join(placeholder)
  })
  body = translate(body)
  Object.entries(values).forEach(([placeholder, value]) => {
    if (value) body = body.split(placeholder).join(value)
  })
  return body
}

// a notification in the app's language: { title, body } from the words in every language the server sends with it
// (data.texts: { SR: { title, body }, EN: ... }), else in English, else null (an older one: translated as stored)
export const notificationTexts = (data, language) => {
  const texts = data && data.texts
  if (!texts || typeof texts !== "object") return null
  return texts[language] || texts.EN || null
}

// notification types that open something when tapped
export const OPENABLE_NOTIFICATIONS = [
  "new-task-offer",
  "new-task-time",
  "review-received",
  "edit-task-offer",
  "claim-complete",
  "new-message-received",
  "new-task-question",
  "answer-task-question",
  "tasker-start-task",
  "accept-task-offer",
  "resolved-dispute"
]
