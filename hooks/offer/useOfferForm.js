// useOfferForm.js
// The amount and explanation of an offer (a new one or a revision). problems() lists what is missing,
// one per line, "" when the offer can be sent; an amount of 0 is no amount (the server refuses it with
// its own alert).
import { useState } from "react"

import { clampPrice } from "../../Helpers/offer"
import { failedRules } from "../../Helpers/validation"

const useOfferForm = () => {
  const [price, setPrice] = useState("")
  const [explanation, setExplanation] = useState("")

  return {
    price,
    setPrice: (typed) => setPrice(clampPrice(typed)),
    explanation,
    setExplanation,
    problems: () =>
      failedRules([
        [!(Number(price) > 0), "useOfferForm.pleaseEnterPrice"],
        [!explanation, "useOfferForm.pleaseEnterExplanation"]
      ]),
    clear: () => {
      setPrice("")
      setExplanation("")
    }
  }
}

export default useOfferForm
