// useAccountActions.js
// Account requests outside the login form: the password reset email, the phone verification SMS and
// its code, logging out on the server, and the Google token for signing in or up.
import useApiAction from "../useApiAction"
import { requestResetPassword, sendVerifySms, checkVerifySms, logout } from "../../Services/API"
import { googleAccessToken, GOOGLE_LOGIN } from "../../Services/socialSignIn"

// run(email)
export const useRequestPasswordReset = ({ onSuccess } = {}) =>
  useApiAction(requestResetPassword, {
    error: "useAccountActions.requestResetPasswordError",
    invalid: { messageKey: "Request reset password error. Please try agin later." },
    failed: "useAccountActions.thereWasAnErrorWhileRequesting",
    onSuccess
  })

// run(phone)
export const useSendVerificationSms = ({ onSuccess } = {}) =>
  useApiAction(sendVerifySms, {
    error: "useAccountActions.sendVerificationCodeError",
    failed: "useAccountActions.thereWasAnErrorWhileSendingVerification",
    onSuccess
  })

// run(phone, code)
export const useCheckVerificationCode = ({ onSuccess } = {}) =>
  useApiAction(checkVerifySms, {
    success: { title: "useAccountActions.verificationSuccess", text: "useAccountActions.youSuccessfullyVerifiedYourPhoneNumber" },
    error: "useAccountActions.verificationCodeSendError",
    failed: "useAccountActions.thereWasAnErrorWhileSendingPhone",
    onSuccess
  })

// run(): the device logs out whatever the server answers (onDone runs either way)
export const useServerLogout = ({ onDone } = {}) => useApiAction(logout, { onSuccess: onDone, onError: onDone })

// the Google access token (null when the user cancelled): "login" or "register"
export const googleToken = () => googleAccessToken(GOOGLE_LOGIN)
