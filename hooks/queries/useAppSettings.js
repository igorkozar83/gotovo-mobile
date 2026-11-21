import { useQuery } from "@tanstack/react-query"

import { getSettings } from "../../Services/settingsAPI"
import { toAppSettings } from "../../Helpers/appSettings"

const EMPTY = { buttons: [], services: [], clientSlider: [], taskerSlider: [], settings: {}, translations: null, minAppVersion: null }

// a failed request is an error (Main shows the "Settings error" alert)
const fetchSettings = async () => toAppSettings(await getSettings())

// App data from /settings: category buttons, services, sliders, settings (currency, fee, languages …)
// and translations. Loaded once when the app starts (Main), read anywhere from the cache.
export const useAppSettingsQuery = () => useQuery({ queryKey: ["appSettings"], queryFn: fetchSettings, staleTime: Infinity, retry: 1 })

const useAppSettings = () => {
  const { data } = useAppSettingsQuery()
  return data || EMPTY
}

export default useAppSettings
