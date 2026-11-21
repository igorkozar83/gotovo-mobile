// useRegisterAction.js
// Registering with email and password. The register modal closes while the request runs; a refused
// registration's alert brings it back so the user can correct the form. An e-mail already registered is an
// error, not a success: its OK opens the login with that e-mail (a guest's task stays as a draft for then).
import { useNavigation } from "@react-navigation/native"

import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"
import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import { register } from "../../Services/API"
import { showErrorThen, showSuccessThen } from "../../stores/alerts"
import { apiError, invalidFields } from "../../Helpers/apiErrors"

// what the server answers (status) for an e-mail whose account is confirmed already
const ALREADY_REGISTERED = "already_registered"

// the server's invalid fields: a taken email gets its own message, the rest "<Field> field is required."
const fieldsMessage = (error) => {
  const data = invalidFields(error)
  if (!data) return null

  return Object.keys(data)
    .map((key) =>
      key === "email" && data[key][0] === "validation.unique"
        ? translate("useRegisterAction.emailIsAlreadyTakenPleaseLogin")
        : key.charAt(0).toUpperCase() + key.slice(1) + " " + translate("useRegisterAction.fieldIsRequired")
    )
    .join("\n")
}

/** onRegistered(): the account was created (e.g. clear the form) */
const useRegisterAction = ({ onRegistered } = {}) => {
  const navigation = useNavigation()
  const setAuthOpen = useUiStore((state) => state.setAuthOpen)
  const setRegisterOpen = useUiStore((state) => state.setRegisterOpen)
  const { showError } = useAlert()

  const registration = useApiAction(register, {
    // the new user goes on to log in with their email (Home opens the login)
    onSuccess: (resp, data) => {
      const toLogin = () => navigation.navigate("Home", { registerSuccess: data.email })
      if (resp.status === ALREADY_REGISTERED) return showErrorThen("useRegisterAction.error", "useRegisterAction.emailAlreadyRegisteredPleaseLogin", toLogin)
      if (onRegistered) onRegistered()
      showSuccessThen("useRegisterAction.registerSuccess", resp.message, toLogin)
    },
    onError: (error) => {
      // the server refused the registration
      const refusal = apiError(error)
      if (refusal && refusal.code !== "invalid") return showError("useRegisterAction.registerError", refusal.message)

      const fields = fieldsMessage(error)
      if (!fields) return showError("useRegisterAction.registerError", "useRegisterAction.thereWasAnErrorWhileRegistering")
      showErrorThen("useRegisterAction.registerError", fields, () => setRegisterOpen(true))
    }
  })

  return {
    doRegisterRequest: (data) => {
      setRegisterOpen(false)
      setAuthOpen(false)
      registration.run(data)
    }
  }
}

export default useRegisterAction
