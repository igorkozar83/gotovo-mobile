// settingsAPI.js
// The app settings (categories, services, sliders, languages, fee, translations) and the oldest app version still
// served (min_app_version); no login needed.
import { publicApi } from "./client"

export const getSettings = async () => (await publicApi.get("settings")).data.data
