// QuestionPostedModal.js
// Confirms a question was posted (title and message as given).
import React from "react"

import BadgeSheet from "../sheets/BadgeSheet"

const QuestionPostedModal = ({ onClose, visible, title, message }) => (
  <BadgeSheet
    visible={visible}
    onClose={onClose}
    badge={require("../../assets/badgequestion.png")}
    title={title || "questionPostedModal.yourMessageHasBeenSent"}
    message={message}
  />
)

export default QuestionPostedModal
