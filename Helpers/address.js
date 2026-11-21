// address.js
// Showing a task's address.
import { Platform } from "react-native"

// the street without its house number ("Main Street 12, Area" -> "Main Street, Area", "12 b Main Street" ->
// "Main Street"; one inside the name stays: "Bulevar 27. marta 5" -> "Bulevar 27. marta"): what a tasker sees before
// their offer is accepted (the server already sends it so: ApproximateAddressResource)
const numbered = (word) => word !== undefined && /\d/.test(word)

export const approximateAddress = (address) => {
  const parts = address.split(",").map((part) => part.trim())
  const words = parts.shift().split(/\s+/).filter(Boolean)
  // a letter after the number ("12 b") goes with it
  if (words.length > 1 && words[words.length - 1].length <= 2 && numbered(words[words.length - 2])) words.pop()
  while (words.length && numbered(words[words.length - 1])) words.pop()
  let leading = false
  while (words.length && numbered(words[0])) {
    words.shift()
    leading = true
  }
  // and at the start too ("12 b Main Street")
  if (leading && words.length > 1 && words[0].length <= 2) words.shift()
  return [words.join(" "), ...parts].filter(Boolean).join(", ")
}

// a link that opens the address in the phone's maps app
export const mapsUrl = (latitude, longitude, label) => {
  const latLng = `${latitude},${longitude}`
  return Platform.select({
    ios: `maps://0,0?q=${label}@${latLng}`,
    android: `geo:0,0?q=${latLng}(${label})`
  })
}

// "lat, lng" as typed or picked -> { latitude, longitude } as text; a missing or "null" part is null
export const parseCoords = (text) => {
  const [latitude, longitude] = (text || "").split(",").map((part) => part.trim())
  const value = (part) => (part && part !== "null" ? part : null)
  return { latitude: value(latitude), longitude: value(longitude) }
}

export const isLatitude = (value) => isFinite(value) && Math.abs(value) <= 90

export const isLongitude = (value) => isFinite(value) && Math.abs(value) <= 180

// a Google place's street, zip and city (read from its adr_address markup) and coordinates; parts it
// doesn't have are undefined
export const placeFromGoogle = (details) => {
  const place = { latitude: details?.geometry?.location?.lat, longitude: details?.geometry?.location?.lng }
  const part = (item, name) => item.replace(new RegExp(`<span class="${name}">|,`, "g"), "").trim()
  ;(details?.adr_address || "").split("</span>").forEach((item) => {
    if (item.includes("street-address")) place.street = part(item, "street-address")
    if (item.includes("postal-code")) place.zip = part(item, "postal-code")
    if (item.includes("locality")) place.city = part(item, "locality")
  })
  return place
}
