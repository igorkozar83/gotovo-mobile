// Offers.js
// The inbox OFFERS tab: the offers (a client's received, a tasker's sent), newest or oldest first. An
// offer opens its details.
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { AntDesign } from "@expo/vector-icons"

import InboxNotificationItem from "./InboxNotificationItem"
import InboxListHeader, { INBOX_HEADER_HEIGHT } from "./InboxListHeader"
import DropdownMenu from "../ui/DropdownMenu"
import CollapsingList from "../lists/CollapsingList"
import useWindowLayout from "../../hooks/useWindowLayout"
import { useOpenTaskOffer } from "../../hooks/queries/useDetails"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

// the inbox's top and the order bar
const HEADER_HEIGHT = INBOX_HEADER_HEIGHT + 46
const SORTS = [
  { value: "newest", label: "offers.newest" },
  { value: "oldest", label: "offers.oldest" }
]

const SortBar = ({ sort, onSort, open, onOpenChange }) => {
  const [layout, onLayout, measure] = useWindowLayout()
  return (
    <View style={styles.sortBar}>
      <Text style={styles.sortLabel}>{translate("offers.sortBy")}</Text>
      <View onLayout={onLayout}>
        <Pressable style={atoms.flexDirectionRow} onPress={() => measure(() => onOpenChange(!open))}>
          <Text style={styles.sortValue}>{sort === "newest" ? translate("offers.newest") : translate("offers.oldest")}</Text>
          <AntDesign name="down" size={16} color={palette.gray600} style={styles.sortIcon} />
        </Pressable>
      </View>
      <DropdownMenu
        visible={open}
        onClose={() => onOpenChange(false)}
        position={{ left: layout.x + 20, top: layout.y + layout.height }}
        options={SORTS}
        selected={sort}
        onSelect={onSort}
      />
    </View>
  )
}

/**
 * offers, fetching, canLoadMore, onLoadMore: the list; sort / onSort, sortOpen / setSortOpen: the order menu
 * viewOffers: only one task's offers (no paging); tab / onTab: the inbox tabs
 */
const Offers = ({ offers, fetching, canLoadMore, onLoadMore, sort, onSort, sortOpen, setSortOpen, viewOffers, tab, onTab }) => {
  const openTaskOffer = useOpenTaskOffer()

  return (
    <CollapsingList
      headerHeight={HEADER_HEIGHT}
      header={
        <>
          <InboxListHeader tab={tab} onTab={onTab} />
          <SortBar sort={sort} onSort={onSort} open={sortOpen} onOpenChange={setSortOpen} />
        </>
      }
      fetching={fetching}
      canLoadMore={canLoadMore && !viewOffers}
      onLoadMore={onLoadMore}
      onEndReachedThreshold={0.3}
      data={offers}
      extraData={[offers]}
      estimatedItemSize={100}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <InboxNotificationItem offer={item} onPress={() => openTaskOffer(item)} />}
    />
  )
}

const styles = StyleSheet.create({
  sortIcon: { top: 3, left: 3 },
  sortBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomColor: palette.gray350,
    borderBottomWidth: 1,
    backgroundColor: palette.white
  },
  sortLabel: { fontFamily: "Montserrat_700Bold", color: palette.gray600, marginRight: 5, fontSize: 12 },
  sortValue: { fontSize: 16, fontFamily: "Montserrat_400Regular", marginLeft: 20, color: palette.gray600 }
})

export default Offers
