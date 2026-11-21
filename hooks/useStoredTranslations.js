// useStoredTranslations.js
// The translations as stored on the device ({ EN, CZ, SR }), for components that look texts up per language.
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { reportError } from "../Helpers/reportError"

const useStoredTranslations = () => {
  const [translations, setTranslations] = useState(null)

  useEffect(() => {
    AsyncStorage.getItem("transl")
      .then((value) => setTranslations(JSON.parse(value)))
      .catch((e) => reportError(e, "useStoredTranslations"))
  }, [])

  return translations
}

export default useStoredTranslations
