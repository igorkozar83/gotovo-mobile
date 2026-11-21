// offer.js
// An offer's amount as typed: whole numbers only, at most 200000 (the field keeps it as text).
import { palette } from "../styles/palette"

export const MAX_OFFER_PRICE = 200000

export const clampPrice = (typed) => {
  const value = Number.parseInt(typed, 10)
  if (Number.isNaN(value)) return ""
  return String(Math.min(value, MAX_OFFER_PRICE))
}

// Offer statuses (API): 0 sent, 1 accepted, 2 finished, 3 completed, 4 canceled, 5 disputed, 6 refused,
// 8 started by the tasker, 9 start confirmed by the client.

// the label an offer's status shows in a list ({ text, color }), null for a status without one;
// a sent offer is a "new offer" to its client
export const offerStatusLabel = (status, forClient) => {
  if (status === 0) return forClient ? { text: "NEW OFFER", color: palette.orange } : { text: "OFFER SENT", color: palette.black }
  if (status === 6) return { text: "REFUSED", color: palette.gray350 }
  if (status === 4) return { text: "CANCELED", color: palette.gray350 }
  if (status === 5) return { text: "DISPUTED", color: palette.red }
  if (status === 2) return { text: "FINISHED", color: palette.blueDark }
  if (status === 3) return { text: "COMPLETED", color: palette.blueDark }
  if ([1, 8, 9].includes(status)) return { text: "ACCEPTED", color: palette.blueDark }
  return null
}

// the colour of the price arrow for an offer's status (PriceTag kind), null for none
export const offerPriceKind = (status) => {
  if (status === 0) return "offer"
  if ([4, 5, 6].includes(status)) return "refused"
  if ([1, 2, 3, 8, 9].includes(status)) return "finished"
  return null
}

// a refused or canceled offer is shown faded
export const isFadedOffer = (status) => status === 4 || status === 6
