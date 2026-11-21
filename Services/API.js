// API.js
// Signing in and out, and the signed-in user (API v2: each call resolves to the answer's data, or nothing; a
// refusal rejects with the API's error, see Helpers/apiError).
import { api, publicApi } from "./client"
import { checkData, loginSchema, userSchema } from "./schemas"

const checkLogin = checkData(loginSchema, "login")
const checkUser = checkData(userSchema, "me")

// { access_token, user }
const signedIn = async (request) => checkLogin((await request).data.data)

export const login = (email, password) => signedIn(publicApi.post("auth/login", { email, password }))

// { status, message }: registered, verification_sent (a new link) or already_registered (log in instead)
export const register = async (data) => (await publicApi.post("auth/register", data)).data.data

export const logout = async () => {
  await api.post("auth/logout")
}

export const loginGoogle = (accessToken, type, lang) => signedIn(publicApi.post("auth/google", { access_token: accessToken, type, lang }))

export const loginApple = (data, type, name = null, lastName = null, lang = null) => signedIn(publicApi.post("auth/apple", { data, name, last_name: lastName, type, lang }))

export const loginFacebook = (accessToken, type, lang) => signedIn(publicApi.post("auth/facebook", { access_token: accessToken, type, lang }))

export const updatePassword = async (newPassword, repeatPassword, oldPassword) => {
  await api.put("me/password", { new_password: newPassword, confirm_new_password: repeatPassword, old_password: oldPassword })
}

// the signed-in user's profile
export const user = async () => checkUser((await api.get("me")).data.data)

export const sendVerifySms = async (phoneNumber) => {
  await api.post("me/phone/verification", { to: phoneNumber })
}

export const checkVerifySms = async (phoneNumber, code) => {
  await api.post("me/phone/verify", { to: phoneNumber, code })
}

export const requestResetPassword = async (email) => {
  await publicApi.post("auth/password-reset", { email })
}
