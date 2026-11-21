// useLoginActions.js
// Logging in (email/password, Google, Facebook, Apple) and requesting the email verification mail.
// The login modal closes while a login runs; a refused email login reopens it from its alert.
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { handleError } from "../../Helpers"
import { accountClosedTitle, apiError } from "../../Helpers/apiErrors"
import useApiAction from "../useApiAction"
import useSession from "./useSession"
import { login, loginGoogle, loginFacebook, loginApple } from "../../Services/API"
import { requestEmailVerification } from "../../Services/UsersAPI"
import { askToConfirm, showError, showErrorThen } from "../../stores/alerts"

// a social login that failed: a closed account (disabled or deleted), or the reason the server gave
const socialFailure = (error) => {
  const failure = handleError(error)
  return { title: failure.type === 0 ? accountClosedTitle(apiError(error)) : "Login Error", text: failure.message }
}

/**
 * onLoggedIn(): after an email login (e.g. clear the form)
 * onPhoneVerify(): the user chose to verify their phone after logging in
 * onAppleNameNeeded(): Apple gave no name, the user has to enter it
 * onAppleLoggedIn(): after an Apple login
 */
const useLoginActions = ({ onLoggedIn, onPhoneVerify, onAppleNameNeeded, onAppleLoggedIn } = {}) => {
  const setAuthOpen = useUiStore((state) => state.setAuthOpen)
  const { signIn } = useSession()

  // an error alert whose OK brings the login modal back
  const reopenLoginAlert = (title, text) => showErrorThen(title, text, () => setAuthOpen(true))

  // an alert offering to verify something now
  const verifyPrompt = (title, text, verify) => askToConfirm({ title, text, cancelText: "common.cancel", confirmText: "useLoginActions.verify", onConfirm: verify })

  const emailVerification = useApiAction(requestEmailVerification, {
    success: {
      title: "useLoginActions.emailVerification",
      text: "useLoginActions.emailVerificationSentSuccessfullyPleaseFollow"
    },
    error: "useLoginActions.emailVerificationError",
    failed: "useLoginActions.weCouldNotSendEmailVerification"
  })

  const emailLogin = useApiAction(login, {
    onSuccess: (resp) => {
      signIn(resp.access_token, resp.user)
      setAuthOpen(false)
      if (onLoggedIn) onLoggedIn()
      if (!resp.user.phone_verified) verifyPrompt("useLoginActions.verifyPhone", "useLoginActions.pleaseVerifyYourPhoneNumberIn", () => onPhoneVerify && onPhoneVerify())
      if (!resp.user.email_verified_at) verifyPrompt("useLoginActions.verifyEmail", "useLoginActions.pleaseVerififyYourEmail", () => emailVerification.run())
    },
    onError: (error) => {
      setAuthOpen(false)
      // the server refused the login
      const refusal = apiError(error)
      if (refusal && refusal.code === "email_not_verified") return reopenLoginAlert("useLoginActions.verifyAccount", refusal.message)
      if (refusal && refusal.code === "account_disabled") return reopenLoginAlert(accountClosedTitle(refusal), refusal.message)
      if (refusal && refusal.code !== "invalid") return reopenLoginAlert("common.loginError", refusal.message)
      // an invalid form, or the request failed
      const failure = handleError(error)
      reopenLoginAlert(failure.type === 0 ? accountClosedTitle(apiError(error)) : "common.loginError", failure.message)
    }
  })

  const googleLogin = useApiAction(loginGoogle, { error: "useLoginActions.loginError", invalid: socialFailure, onSuccess: (resp) => signIn(resp.access_token, resp.user) })

  const facebookLogin = useApiAction(loginFacebook, { error: "useLoginActions.loginError", invalid: socialFailure, onSuccess: (resp) => signIn(resp.access_token, resp.user) })

  const appleLogin = useApiAction(loginApple, {
    invalid: socialFailure,
    onSuccess: (resp) => {
      signIn(resp.access_token, resp.user)
      if (onAppleLoggedIn) onAppleLoggedIn()
    },
    onError: (error) => {
      const refusal = apiError(error)
      if (!refusal || refusal.code === "invalid") return
      if (refusal.code === "name_needed") return onAppleNameNeeded && onAppleNameNeeded()
      showError("useLoginActions.loginError", refusal.message)
    }
  })

  // the role and language the social account is created with, as they are when the user taps
  const signUpAs = () => ({ type: useAuthStore.getState().user.type, language: useUiStore.getState().language })

  return {
    doLogin: (email, password) => emailLogin.run(email, password),
    doLoginGoogle: (accessToken) => {
      setAuthOpen(false)
      googleLogin.run(accessToken, signUpAs().type, signUpAs().language)
    },
    doLoginFacebook: (accessToken) => {
      setAuthOpen(false)
      facebookLogin.run(accessToken, signUpAs().type, signUpAs().language)
    },
    doLoginApple: (appleData, name = null, lastName = null) => {
      setAuthOpen(false)
      appleLogin.run(appleData, signUpAs().type ?? 0, name, lastName, signUpAs().language)
    },
    doVerifyEmail: () => emailVerification.run()
  }
}

export default useLoginActions
