// OfferSentModal.js
// Confirms the tasker's offer was sent.
import React from "react"

import BadgeSheet from "../sheets/BadgeSheet"

const OfferSentModal = ({ onClose, visible }) => (
  <BadgeSheet
    visible={visible}
    onClose={onClose}
    badge={require("../../assets/badgecheckmark.png")}
    title={"offerSentModal.yourOfferHasBeenSent"}
    message={"offerSentModal.congratulationsYouHaveSuccessfullySentAn"}
  />
)

export default OfferSentModal
