import { translate } from "./language.utils"
import { handleError } from "./index"
import { accountClosedTitle, apiError } from "./apiError"

export { accountClosedTitle, apiError }

// the invalid fields of a failed request ({ field: ["message key", ...] }), or null when it was no invalid form
export const invalidFields = (error) => {
  const failure = apiError(error)
  return failure && failure.code === "invalid" ? failure.fields : null
}

// The message for a failed request whose response lists invalid fields ({ field: [...] }),
// one line per field: "Please enter <field>." ("message" gets the generic messageKey instead).
// Returns null when the error has no such list.
export const validationMessage = (error, { messageKey = "Error occured. Please try agin later.", field = (key) => key } = {}) => {
  const data = invalidFields(error)
  if (!data) return null

  return Object.keys(data)
    .map((key) => (key === "message" ? translate(messageKey) : translate("apiErrors.pleaseEnter") + field(key) + "."))
    .join("\n")
}

// The server's own messages of a failed request ({ field: ["message", ...] } or { field: "message" }),
// translated, one per line. With `known` ({ serverMessage: text }) only those messages are listed, as
// their text. Returns null when the error has no such list (or none of its messages is known).
export const serverMessages = (error, known = null) => {
  const data = invalidFields(error)
  if (!data) return null

  const messages = Object.values(data).flat().map(String)
  const lines = known ? messages.filter((message) => known[message]).map((message) => known[message]) : messages
  return lines.length ? lines.map((line) => translate(line)).join("\n") : null
}

// A failed request's invalid fields as "<Field> field is required.", one per line (null when none).
export const requiredFieldsMessage = (error) => {
  const data = invalidFields(error)
  if (!data) return null

  return Object.keys(data)
    .map((key) => key.charAt(0).toUpperCase() + key.slice(1) + translate("apiErrors.fieldIsRequired"))
    .join("\n")
}

// validationMessage options for the payment forms: their fields are named in capitals ("COUNTRY CODE")
export const PAYMENT_FIELDS = { field: (key) => key.replace("_", " ").toUpperCase() }

// useApiAction `invalid` formatter for the account-bound actions (post a task, log in, register): a request
// refused as unauthorized means the account is closed (disabled or deleted), anything else gets `title` (see Helpers.handleError)
export const accountFailure = (title) => (error) => {
  const failure = handleError(error)
  return { title: failure.type === 1 ? title : accountClosedTitle(apiError(error)), text: failure.message }
}
