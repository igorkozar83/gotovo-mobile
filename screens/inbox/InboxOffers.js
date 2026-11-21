// InboxOffers.js
// The inbox's OFFERS tab: the offers (a client's received, a tasker's sent), newest or oldest first, or
// only one task's when the inbox was opened from it (viewOffers). Loads while it is shown.
import React, { useLayoutEffect, useState } from "react"
import { useIsFocused } from "@react-navigation/native"

import Offers from "../../components/inbox/Offers"
import useListSpinner from "../../hooks/useListSpinner"
import { useOffersList } from "../../hooks/queries/useInbox"
import { useInboxParams } from "./InboxParams"
import { inboxRoute } from "./inboxTabs"

export default function InboxOffers({ navigation }) {
  const isFocused = useIsFocused()
  const params = useInboxParams()
  const [sort, setSort] = useState("newest")
  const [sortOpen, setSortOpen] = useState(false)

  const offersList = useOffersList({ filter: params?.viewOffers ? { task_id: params.taskDetailsId } : null, sort, sortPrice: null }, isFocused)
  useListSpinner(isFocused && offersList.isFetching)

  // the order menu closes when the tab is left or the order changes
  useLayoutEffect(() => {
    setSortOpen(false)
  }, [isFocused, sort])

  return (
    <Offers
      offers={offersList.offers}
      fetching={offersList.isFetching}
      canLoadMore={offersList.canLoadMore}
      onLoadMore={offersList.loadMore}
      sort={sort}
      onSort={setSort}
      sortOpen={sortOpen}
      setSortOpen={setSortOpen}
      viewOffers={params?.viewOffers}
      tab="OFFERS"
      onTab={(key) => navigation.navigate(inboxRoute(key))}
    />
  )
}
