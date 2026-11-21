// validation.js
// Checking form input before it is sent.
import { translate } from "./language.utils"

// an e-mail address as the forms take it (the post-a-task schema too)
export const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export const isValidEmail = (email) => EMAIL.test(email)

// the translated messages of the rules that fail, in order, one per line: [[failed, message], ...]
export const failedRules = (rules) =>
  rules
    .filter(([failed]) => failed)
    .map(([, message]) => translate(message))
    .join("\n")

// what is wrong with a new password and its repetition (translated, one per line), or "" when nothing is
export const newPasswordProblems = (password, repeated) =>
  failedRules([
    [password.length < 8, "formRules.minimumPasswordLengthIs8"],
    [password !== repeated, "formRules.newPasswordAndRepeatNewPassword"]
  ])
