// index.js
// Small helpers: names, dates in the app's language, stars, prices and error texts.
import moment from "moment"
import "moment/locale/cs"
import "moment/locale/sr"
import "moment/locale/en-gb"

import { apiError } from "./apiError"

// --- names ("First_Last" full names)

export const fName = (fullName) => (fullName ? fullName.split(" ")[0] : "")

export const lName = (fullName, shorten = false) => {
  if (!fullName) return ""
  const parts = fullName.split("_")
  if (parts[1] && shorten) parts[1] = parts[1].charAt(0)
  return parts[1] ? parts[1] : ""
}

// "First L." (a trailing space without a last name, as before)
export const shortenName = (fullName) => {
  if (!fullName) return ""
  const parts = fullName.split("_")
  return parts[0] + " " + (parts[1] ? parts[1] + "." : " ")
}

export const shortenString = (string, length = 40) => {
  if (!string) return ""
  return string.length <= length ? string : string.substring(0, length) + "..."
}

// --- dates in the app's language ("CZ", "SR", "EN"; anything else uses moment's current locale)

const LOCALES = { CZ: "cs", SR: "sr", EN: "en-gb" }
const localized = (time, lang) => moment(time).locale(LOCALES[lang] || null)

export const timeFormat = (time, lang) => localized(time, lang).format("D MMMM HH:mm")
export const dateDotTime = (time, lang) => localized(time, lang).format("D. MMMM HH:mm")
export const dateDotShortMonthTime = (time, lang) => localized(time, lang).format("D. MMM HH:mm")
export const timeFormatFullYear = (time, lang) => localized(time, lang).format("D MMMM YYYY. HH:mm")
export const timeFormatNoTime = (time, lang) => localized(time, lang).format("D. MMMM YYYY.")
export const dateMonth = (time, lang) => (time ? localized(new Date(time), lang).format("Do MMM") : "")
export const dateDotThreeMonth = (time, lang) => localized(new Date(time), lang).format("D. MMM")
export const day = (time, lang) => localized(time, lang).format("D")
export const monthThree = (time, lang) => localized(time, lang).format("MMM")
export const toDate = (date, lang) =>
  moment(date, "YYYY-MM-DD'T'HH:mm:ss.sssZ")
    .locale(LOCALES[lang] || null)
    .toDate()

export const hourMin = (time) => moment(new Date(time)).format("HH:mm")
export const year = (time) => moment(time).format("YYYY")
export const getDate = (time = null) => (time ? moment(time) : moment()).format("YYYY-MM-DD")
export const zuluT = () => moment().format("YYYY-MM-DDTHH:mm:ss.sssZ")

// now - time in `type` units (positive once the time has passed)
export const checkDiffToday = (time, type = "days") => moment().diff(moment(time), type)
// whole days from the time's date to today
export const checkDiffDates = (time) => moment(getDate()).diff(moment(moment(time).format("YYYY-MM-DD")), "days")

// --- ratings and prices

// a user's average stars from their review counts (0 without reviews), as text with `fixed` decimals
export const calcStars = (data, fixed = 0) => {
  if (!data || !data.id || !data.reviews.total) return 0
  const { five_star, four_star, three_star, two_star, one_star, total } = data.reviews
  return ((five_star * 5 + four_star * 4 + three_star * 3 + two_star * 2 + one_star) / total).toFixed(fixed)
}

// an amount as the app shows it, whole with a dot between thousands ("12.500"): from a number or the server's
// "12500.00"; text already shown that way (or anything else) stays as it is
export const amount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? localPriceFixed(Math.round(value)) : ""
  if (typeof value === "string" && /^\d+(\.\d{1,2})?$/.test(value.trim())) return localPriceFixed(Math.round(parseFloat(value)))
  return value
}

export const localPriceFixed = (price) =>
  price
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    .slice(0, -3)

// --- files and errors

// a photo's address (anything else is a video); null without one
export const isImage = (file) => (file ? /\.(jpg|jpeg|png|gif)$/i.test(file) : null)

// an axios error as { message, type }: 0 a disabled account, 2 not found, 1 anything else (an invalid form lists
// its fields; no message without an API answer)
export const handleError = (error) => {
  const failure = apiError(error)
  if (!failure) return { message: "", type: 1 }
  if (failure.code === "account_disabled") return { message: failure.message, type: 0 }
  if (failure.status === 404) return { message: failure.message, type: 2 }
  if (failure.code === "invalid") return { message: fieldsMessage(failure.fields || {}), type: 1 }
  return { message: failure.message, type: 1 }
}

// "Please enter <field>." for each invalid field, one per line (a file too large says so)
const fieldsMessage = (fields) =>
  Object.keys(fields)
    .map((field) => {
      if (field === "message") return "Error occured. Please try agin later."
      const value = fields[field]
      if (field.indexOf("files") > -1 && value && value.length && value[0] === "validation.max.file")
        return "Your file size exceeded max upload file size of 50MB. Please reduce file size and try again."
      return "Please enter " + field + "."
    })
    .join("\n")

// replaces every key of obj (a regex source) in str with its value
export const allReplace = (str, obj) => Object.keys(obj).reduce((result, key) => result.replace(new RegExp(key, "g"), obj[key]), str)
