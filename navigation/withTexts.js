// withTexts.js
// A screen drawn again whole when the language or the texts in use change (uiStore.textsVersion): its texts
// come from translate() as it draws, so a new language reaches every text of it. The navigation is not touched
// (the user stays on the screen they are on); what the screen held only for itself (a half-typed form) starts
// over, as it does when the user switches language anyway.
import React from "react"

import useUiStore, { textsKey } from "../stores/uiStore"

const withTexts = (Screen) => {
  const WithTexts = (props) => {
    const texts = useUiStore(textsKey)
    return <Screen key={texts} {...props} />
  }
  WithTexts.displayName = `WithTexts(${Screen.displayName || Screen.name || "Screen"})`
  return WithTexts
}

export default withTexts
