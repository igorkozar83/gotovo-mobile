// authToken.js
// The login token.
import { saveKey, getKey, deleteKey } from "../Helpers/secureStorage"

export const TOKEN_KEY = "hotovoToken"

// the token is read from SecureStore once and then kept in memory; every change goes through here
let cached // undefined until loaded

export const getToken = async () => {
  if (cached === undefined) cached = (await getKey(TOKEN_KEY)) || null
  return cached
}

export const setToken = async (token) => {
  cached = token
  await saveKey(TOKEN_KEY, token)
}

export const clearToken = async () => {
  cached = null
  await deleteKey(TOKEN_KEY)
}
