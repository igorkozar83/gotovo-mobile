// useAppData.js
// The app's data (categories, sliders, settings, translations) loaded once at start: the spinner shows
// while it loads, its translations are used (the screens draw again only when they differ from the ones in
// use), and an alert tells the user when it could not be loaded.
import { useEffect } from "react"

import { applyServerTranslations } from "../../Helpers/language.utils"
import { useAppSettingsQuery } from "../queries/useAppSettings"
import useEvent from "../useEvent"
import useListSpinner from "../useListSpinner"
import useUiStore from "../../stores/uiStore"
import { reportError } from "../../Helpers/reportError"
import { showNotice } from "../../stores/alerts"

const useAppData = () => {
  const appSettings = useAppSettingsQuery()
  const { setTextsVersion } = useUiStore.getState()
  // the settings load on the spinner
  useListSpinner(appSettings.isFetching)

  // (They used to send the app Home too: at a cold start from a tapped push that undid the push's screen.)
  const applyTranslations = useEvent(async (translations) => {
    try {
      if (await applyServerTranslations(translations)) setTextsVersion((version) => version + 1)
    } catch (e) {
      reportError(e, "useAppData.translations")
    }
  })

  useEffect(() => {
    if (!appSettings.data) return
    applyTranslations(appSettings.data.translations)
    // the first category is chosen once the categories are there (the featured one has id 0). (Here, where
    // the settings arrive: Home, which did it before, is not drawn again when they do.)
    const { selectedCat, setSelectedCat } = useUiStore.getState()
    if (selectedCat === null && appSettings.data.buttons.length) setSelectedCat(appSettings.data.buttons[0].id)
  }, [appSettings.data, applyTranslations])

  useEffect(() => {
    if (!appSettings.errorUpdatedAt) return
    showNotice("useAppData.settingsError", "useAppData.thereWasAnErrorWhileReceiving")
  }, [appSettings.errorUpdatedAt])
}

export default useAppData
