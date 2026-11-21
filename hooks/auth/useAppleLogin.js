// useAppleLogin.js
// Logging in with Apple: the device gives a credential, the server logs in with it; when Apple gave no
// name, the name modal asks for it and the login is sent again with it.
import { useEffect, useState } from "react"

import useLoginActions from "./useLoginActions"
import useAlert from "../useAlert"
import { appleAvailable, appleCredential } from "../../Services/socialSignIn"
import { failedRules } from "../../Helpers/validation"
import { reportError } from "../../Helpers/reportError"

/**
 * beforeLogin(): runs before each server login (e.g. close the register modal)
 * failedText: the alert text when the device sign-in fails
 */
const useAppleLogin = ({ beforeLogin, failedText }) => {
  const [available, setAvailable] = useState(false)
  const [credential, setCredential] = useState(null)
  const [nameOpen, setNameOpen] = useState(false)
  const { showError, showErrorThen } = useAlert()
  const { doLoginApple } = useLoginActions({
    onAppleNameNeeded: () => setNameOpen(true),
    onAppleLoggedIn: () => setNameOpen(false)
  })

  useEffect(() => {
    appleAvailable().then(setAvailable)
  }, [])

  const login = (...args) => {
    if (beforeLogin) beforeLogin()
    doLoginApple(...args)
  }

  return {
    available,
    start: async () => {
      try {
        const signedIn = await appleCredential()
        setCredential(signedIn)
        login(signedIn)
      } catch (e) {
        reportError(e, "useAppleLogin")
        showError("useAppleLogin.loginError", failedText)
      }
    },
    nameModal: {
      open: nameOpen,
      close: () => setNameOpen(false),
      submit: (name, lastName) => {
        const errors = failedRules([
          [!name, "useAppleLogin.pleaseEnterValidName"],
          [!lastName, "useAppleLogin.pleaseEnterValidLastName"]
        ])
        if (!errors) return login(credential, name, lastName)
        setNameOpen(false)
        showErrorThen("common.loginError", errors, () => setNameOpen(true))
      }
    }
  }
}

export default useAppleLogin
