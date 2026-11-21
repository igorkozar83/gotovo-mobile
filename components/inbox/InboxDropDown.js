// InboxDropDown.js
// The white dropdown of the inbox's ask-a-question form (the task to ask about) over its options (children).
import React from "react"

import FadeDropdown from "../ui/FadeDropdown"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const WHITE = { background: palette.white, openBackground: palette.white, chevron: "black", textStyle: { color: palette.black, textTransform: "uppercase" } }

// title: the chosen option; close: bump to close
const InboxDropDown = ({ children, title, close }) => (
  <FadeDropdown title={title} close={close} look={WHITE} panelStyle={atoms.width100Percent}>
    {children}
  </FadeDropdown>
)

export default InboxDropDown
