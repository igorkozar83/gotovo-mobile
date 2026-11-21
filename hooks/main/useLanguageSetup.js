// useLanguageSetup.js
// The app's language: the stored one, or Serbian the first time (whatever the device's). A chosen
// language is stored, applied to the translations and the screens, and saved on the server (quietly;
// it only affects what the server sends) while logged in.
import { useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import useApiAction from "../useApiAction"
import useUiStore from "../../stores/uiStore"
import useAuthStore from "../../stores/authStore"
import { updateLanguage } from "../../Services/UsersAPI"
import { FIRST_LANGUAGE, initTranslations } from "../../Helpers/language.utils"
import { reportError } from "../../Helpers/reportError"

export const LANGUAGE_KEY = "@language"

// stores and applies a language ("EN", "SR", ...)
export const chooseLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang)
  } catch (e) {
    reportError(e, "useLanguageSetup")
  }
  try {
    await initTranslations()
  } catch (e) {
    reportError(e, "useLanguageSetup")
  }
  // (the screens draw again with it: App keys the navigator on the language)
  useUiStore.getState().setLanguage(lang)
}

const useLanguageSetup = () => {
  const language = useUiStore((state) => state.language)
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const { run: save } = useApiAction(updateLanguage, { spinner: false })

  useEffect(() => {
    const start = async () => {
      let stored = null
      try {
        stored = await AsyncStorage.getItem(LANGUAGE_KEY)
      } catch (e) {
        reportError(e, "useLanguageSetup")
      }
      chooseLanguage(stored || FIRST_LANGUAGE)
    }
    start()
  }, [])

  useEffect(() => {
    if (language && loggedIn) save(language)
  }, [language, loggedIn, save])
}

export default useLanguageSetup
