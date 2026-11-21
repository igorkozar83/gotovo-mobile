// accessibility.js
// What a screen reader says: a field's or control's name, an announcement; and the extra touch area of small tap targets.
import { AccessibilityInfo } from "react-native"

import { translate } from "./language.utils"

// a label as it is shown ("EMAIL:", "NAME*:") → the name a screen reader says ("EMAIL", "NAME")
export const spokenLabel = (key) =>
  key
    ? translate(key)
        .replace(/[\s:*.]+$/, "")
        .replace(/\*/g, "")
    : key

// a screen reader says the parts that are there (translation keys), as one sentence each
export const announce = (...parts) => {
  const message = parts
    .filter(Boolean)
    .map((part) => translate(part))
    .join(". ")
  if (message) AccessibilityInfo.announceForAccessibility(message)
}

// the touch area around small icon buttons, so a finger doesn't have to hit the icon exactly
export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 }
// only above and below: for buttons standing close side by side, so one doesn't take the other's taps
export const HIT_SLOP_ROW = { top: 10, bottom: 10 }
