// useRegisterForm.js
// The register modal's form: its fields, the accepted terms, the checks before registering, and signing
// up with Google or Apple (which need the terms accepted too). A form that doesn't pass the checks is
// explained in an alert whose OK brings the modal back.
import { useState } from "react"

import useLoginActions from "./useLoginActions"
import useRegisterAction from "./useRegisterAction"
import useAppleLogin from "./useAppleLogin"
import { googleToken } from "./useAccountActions"
import useAlert from "../useAlert"
import useUiStore from "../../stores/uiStore"
import { isValidEmail, failedRules } from "../../Helpers/validation"

export const EMPTY_FORM = { name: "", lastname: "", email: "", password: "", confirmPassword: "" }

// the reasons the form can't be sent yet, one per line ("" when it can be sent)
export const registerProblems = (form, agreement) =>
  failedRules([
    [!isValidEmail(form.email), "useRegisterForm.pleaseEnterValidEmail"],
    [form.password.length < 8, "useRegisterForm.minimumPasswordLengthIs8"],
    [form.password !== form.confirmPassword, "useRegisterForm.passwordAndConfirmPasswordDoNot"],
    [!form.name, "useRegisterForm.pleaseEnterName"],
    [!agreement, "useRegisterForm.pleaseAcceptTermsConditions"],
    [!form.lastname, "useRegisterForm.pleaseEnterLastName"]
  ])

const useRegisterForm = () => {
  const { setRegisterOpen } = useUiStore.getState()
  const { showErrorThen } = useAlert()
  const [form, setForm] = useState(EMPTY_FORM)
  const [agreement, setAgreement] = useState(false)

  const { doRegisterRequest } = useRegisterAction({ onRegistered: () => setForm(EMPTY_FORM) })
  const { doLoginGoogle } = useLoginActions()
  const apple = useAppleLogin({ beforeLogin: () => setRegisterOpen(false), failedText: "Please check your apple password." })

  // an alert about the form; its OK brings the modal back
  const refuse = (title, errors) => {
    setRegisterOpen(false)
    showErrorThen(title, errors, () => setRegisterOpen(true))
  }

  // social sign-up needs the terms accepted too
  const withAgreement = (signUp) => () => (agreement ? signUp() : refuse("Register Error", "Please accept terms & conditions."))

  const registerWithGoogle = async () => {
    const token = await googleToken()
    if (!token) return
    setRegisterOpen(false)
    doLoginGoogle(token)
  }

  const submit = () => {
    const errors = registerProblems(form, agreement)
    if (errors) return refuse("Registration error", errors)
    doRegisterRequest({
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword,
      full_name: form.name,
      last_name: form.lastname,
      lang: useUiStore.getState().language
    })
  }

  return {
    // a field's value and change handler
    field: (key) => ({ value: form[key], onChangeText: (text) => setForm((current) => ({ ...current, [key]: text })) }),
    agreement,
    setAgreement,
    submit,
    onGoogle: withAgreement(registerWithGoogle),
    onApple: withAgreement(apple.start),
    apple
  }
}

export default useRegisterForm
