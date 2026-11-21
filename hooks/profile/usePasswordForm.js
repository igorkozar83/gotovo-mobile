// usePasswordForm.js
// Changing the password from the profile: the current password (not for social logins), the new one
// and its repetition. The modal closes on sending; the form is cleared whatever the server answers.
import { useState } from "react"

import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { updatePassword } from "../../Services/API"
import { newPasswordProblems } from "../../Helpers/validation"

const usePasswordForm = (close) => {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [repeated, setRepeated] = useState("")
  const { showError } = useAlert()

  const clear = () => {
    close()
    setCurrent("")
    setNext("")
    setRepeated("")
  }

  const change = useApiAction(updatePassword, {
    success: { title: "usePasswordForm.passwordChangeSuccess", text: "usePasswordForm.passwordUpdatedSuccessfully" },
    error: "usePasswordForm.passwordChangeFail",
    failed: "usePasswordForm.passwordChangeWasUnsuccessfullPleaseTry",
    onSuccess: clear,
    onError: clear
  })

  const submit = () => {
    close()
    const problems = newPasswordProblems(next, repeated)
    if (problems) return showError("usePasswordForm.changePassworsError", problems)
    change.run(next, repeated, current)
  }

  return { current, setCurrent, next, setNext, repeated, setRepeated, submit }
}

export default usePasswordForm
