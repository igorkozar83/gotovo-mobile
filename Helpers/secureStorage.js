// secureStorage.js
import * as SecureStore from "expo-secure-store"
import { reportError } from "./reportError"

// SecureStore wrappers; failures are logged and swallowed, as the app has always done

export const saveKey = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value)
  } catch (e) {
    reportError(e, "secureStorage")
  }
}

export const getKey = async (key) => {
  try {
    return await SecureStore.getItemAsync(key)
  } catch (e) {
    reportError(e, "secureStorage")
  }
}

export const deleteKey = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key)
  } catch (e) {
    reportError(e, "secureStorage")
  }
}
