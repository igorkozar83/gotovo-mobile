// useListSpinner.js
// A list's loading shown on the app's spinner (ActivityInd): held while `fetching`, let go when it stops
// or the list goes away (the spinner counts its holders: uiStore.showSpinner).
import { useEffect } from "react"

import useUiStore from "../stores/uiStore"

const useListSpinner = (fetching) => {
  useEffect(() => {
    if (!fetching) return undefined
    return useUiStore.getState().showSpinner()
  }, [fetching])
}

export default useListSpinner
