// ClientHome.js
// Client Home: the services of the chosen category, narrowed by the search. The search clears when the
// language changes.
import React, { useEffect, useMemo, useState } from "react"

import HomeClientCategoriesList from "../../components/home/HomeClientCategoriesList"
import useAppSettings from "../../hooks/queries/useAppSettings"
import useUiStore, { isSpinning } from "../../stores/uiStore"
import { filterServices } from "../../Helpers/services"

const ClientHome = () => {
  const appSettings = useAppSettings()
  const category = useUiStore((state) => state.selectedCat)
  const language = useUiStore((state) => state.language)
  const loading = useUiStore(isSpinning)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setSearch("")
  }, [language])

  // nothing shows until a category is chosen; the search matches the names in the current language, so a
  // language change filters again
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const services = useMemo(() => (category === null ? [] : filterServices(appSettings.services, category, search)), [appSettings.services, category, search, language])

  return (
    <HomeClientCategoriesList
      services={services}
      search={search}
      onSearch={setSearch}
      found={search ? services.length : 0}
      fetching={loading}
      extraData={[language, appSettings.settings]}
    />
  )
}

export default ClientHome
