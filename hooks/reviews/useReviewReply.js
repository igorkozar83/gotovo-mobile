// useReviewReply.js
// Replying to a review the user received. The form closes on sending; the result is announced in an
// alert whose OK closes it (a saved reply reloads the reviews).
import { useState } from "react"

import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { submitReviewReply } from "../../Services/TasksAPI"
import { failedRules } from "../../Helpers/validation"
import { apiError } from "../../Helpers/apiErrors"
import { showSuccessThen } from "../../stores/alerts"

// data: the review ({ taskId, ... }); close: closes the form
const useReviewReply = (data, close) => {
  const [message, setMessage] = useState("")
  const { showError, showErrorThen } = useAlert()

  // the success alert with an OK that closes it
  const announce = (title) => showSuccessThen(title, "")

  const reply = useApiAction(submitReviewReply, {
    invalid: {},
    failedTitle: "common.taskReviewCreateError",
    failed: "useReviewReply.thereWasAnErrorWhileCreating",
    invalidate: [["reviews"]],
    onSuccess: () => {
      setMessage("")
      announce("THANK YOU! YOUR REPLY HAS BEEN SUBMITTED.")
    },
    // the server refused it (a failed request has had its alert)
    onError: (error) => {
      const refusal = apiError(error)
      if (refusal && refusal.code !== "invalid") showErrorThen("common.taskReviewCreateError", refusal.message, () => {})
    }
  })

  const submit = () => {
    close()
    const problems = failedRules([
      [!data.taskId, "useReviewReply.taskIdIsNotSet"],
      [!message, "useReviewReply.pleaseEnterMessage"]
    ])
    if (problems) return showError("common.taskReviewCreateError", problems)
    reply.run({ task_id: data.taskId, message })
  }

  return { message, setMessage, submit }
}

export default useReviewReply
