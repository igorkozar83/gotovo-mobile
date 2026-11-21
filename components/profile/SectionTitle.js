// SectionTitle.js
// A profile section's underlined title with its help tooltip.
import React from "react"

import TitleWithBorder from "../ui/TitleWithBorder"
import HelpTip from "../ui/HelpTip"

const SectionTitle = ({ title, tip }) => (
  <TitleWithBorder title={title}>
    <HelpTip textKey={tip} />
  </TitleWithBorder>
)

export default SectionTitle
