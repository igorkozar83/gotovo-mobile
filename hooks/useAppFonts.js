// useAppFonts.js
// The app's Montserrat weights, loaded once at the start. The splash screen stays up until they are
// ready (true), so no text is ever drawn in a fallback font.
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import {
  useFonts,
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold
} from "@expo-google-fonts/montserrat"
import { reportError } from "../Helpers/reportError"

SplashScreen.preventAutoHideAsync().catch(() => {})

const useAppFonts = () => {
  const [loaded, error] = useFonts({ Montserrat_300Light, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_800ExtraBold })
  const ready = loaded || !!error

  useEffect(() => {
    if (error) reportError(error, "useAppFonts")
    if (ready) SplashScreen.hideAsync().catch(() => {})
  }, [ready, error])

  return ready
}

export default useAppFonts
