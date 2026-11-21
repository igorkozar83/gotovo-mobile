// InboxParams.js
// The inbox route's params (screens/Notifications), for its tabs: the offers tab filters on viewOffers /
// taskDetailsId, the params of the last navigation to the inbox.
import { createContext, useContext } from "react"

export const InboxParamsContext = createContext(undefined)

export const useInboxParams = () => useContext(InboxParamsContext)
