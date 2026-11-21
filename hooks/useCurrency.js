// useCurrency.js
// The app's currency, upper-cased as prices show it (null until the settings load).
import useAppSettings from "./queries/useAppSettings"

const useCurrency = () => {
  const { settings } = useAppSettings()
  return settings && settings.currency ? settings.currency.toUpperCase() : null
}

export default useCurrency
