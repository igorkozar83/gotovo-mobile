// uiStore.js
// App-wide UI state: the spinner, the login/register modals, the side menu, the header, the language.
// The spinner counts what shows it: showSpinner() adds one and returns its own hide(), so one loader
// ending never hides another's (a single on/off flag did, with 19 writers).
import { create } from "zustand"

import { withSetters } from "./fields"

// the spinner shows while anything holds it
export const isSpinning = (state) => state.spinners > 0
// the language and the texts in use: what draws again when either changes subscribes to it
export const textsKey = (state) => state.language + ":" + state.textsVersion

const useUiStore = create((set) => ({
  ...withSetters(set, {
    spinners: 0, // how many loaders hold the spinner (showSpinner)
    navigationReady: false, // the navigator is up (App's onReady): a push tapped at a cold start waits for it
    authOpen: false,
    registerOpen: false,
    headerMenuOpen: false,
    openMenuContext: false, // the side menu
    language: null,
    textsVersion: 0, // bumped when new texts are in use: the screens draw again (App keys the navigator on it)
    currentServiceId: 0,
    selectedCat: null,
    selectedJobId: null
  }),
  // shows the spinner; the returned hide() (once) lets go of it
  showSpinner: () => {
    set((state) => ({ spinners: state.spinners + 1 }))
    let shown = true
    return () => {
      if (!shown) return
      shown = false
      set((state) => ({ spinners: Math.max(0, state.spinners - 1) }))
    }
  }
}))

export default useUiStore
