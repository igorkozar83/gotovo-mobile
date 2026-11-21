// useLoginForm.js
// The login modal's form: email and password (the email just registered with fills it in), the checks
// before logging in, Google and Apple, and the phone verification a login may ask for. A form that
// doesn't pass the checks is explained in an alert whose OK brings the modal back.
import { useEffect, useState } from "react"

import useLoginActions from "./useLoginActions"
import useAppleLogin from "./useAppleLogin"
import { googleToken } from "./useAccountActions"
import useAlert from "../useAlert"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { isValidEmail, failedRules } from "../../Helpers/validation"

// the reasons the form can't be sent yet, one per line ("" when it can be sent)
export const loginProblems = (email, password) =>
  failedRules([
    [!isValidEmail(email), "useLoginForm.pleaseEnterValidEmail"],
    [password.length < 8, "useLoginForm.minimumPasswordLengthIs8"]
  ])

const useLoginForm = () => {
  const preEmail = useAuthStore((state) => state.preEmail)
  const authOpen = useUiStore((state) => state.authOpen)
  const { showErrorThen } = useAlert()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verifyPhoneOpen, setVerifyPhoneOpen] = useState(false)

  const { doLogin, doLoginGoogle } = useLoginActions({
    onLoggedIn: () => {
      setEmail("")
      setPassword("")
    },
    onPhoneVerify: () => setVerifyPhoneOpen(true)
  })
  const apple = useAppleLogin({ failedText: "Please check our apple password." })

  // the email just registered with fills the form
  useEffect(() => {
    if (preEmail) setEmail(preEmail)
  }, [preEmail, authOpen])

  const submit = () => {
    const errors = loginProblems(email, password)
    if (!errors) return doLogin(email, password)
    const { setAuthOpen } = useUiStore.getState()
    setAuthOpen(false)
    showErrorThen("common.loginError", errors, () => setAuthOpen(true))
  }

  const loginWithGoogle = async () => {
    const token = await googleToken()
    if (token) doLoginGoogle(token)
  }

  return { email, setEmail, password, setPassword, submit, loginWithGoogle, apple, verifyPhoneOpen, setVerifyPhoneOpen }
}

export default useLoginForm
