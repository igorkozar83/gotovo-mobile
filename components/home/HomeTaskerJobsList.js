// HomeTaskerJobsList.js
// The tasker's Home: the category scroller and the filters on top, then the open tasks, refreshed by
// pulling and loaded page by page. A task opens its details.
import React, { useEffect, useState } from "react"
import { View, Pressable, RefreshControl, StyleSheet } from "react-native"
import { FlashList } from "@shopify/flash-list"

import HomeTaskerItem from "./HomeTaskerItem"
import TopPart from "./TopPart"
import JobsFilterBar from "./JobsFilterBar"
import { useOpenTaskDetails } from "../../hooks/queries/useDetails"
import { atoms } from "../../styles/atoms"

const JobItem = ({ task, onPress }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={task.name} style={atoms.backgroundColorWhite} onPress={onPress}>
    <HomeTaskerItem task={task} />
  </Pressable>
)

/**
 * filters: JobsFilterBar's props
 * fetching: the list is (re)loading; onRefresh / onLoadMore: reload it, or load the next page
 */
const HomeTaskerJobsList = ({ filters, tasks, fetching, canLoadMore, onRefresh, onLoadMore }) => {
  const openTaskDetails = useOpenTaskDetails()

  // pulled to refresh: the spinner shows until the reload ends (the tasks may come back unchanged)
  const [pulled, setPulled] = useState(false)
  useEffect(() => {
    if (!fetching) setPulled(false)
  }, [fetching])

  const openTask = (task) => openTaskDetails(task)

  return (
    <>
      <View style={[styles.screen, fetching && !pulled && { opacity: 0.3 }]}>
        <FlashList
          contentContainerStyle={atoms.paddingBottom100}
          refreshControl={
            <RefreshControl
              progressViewOffset={100}
              enabled={true}
              size="large"
              refreshing={pulled}
              onRefresh={() => {
                setPulled(true)
                if (!fetching) onRefresh()
              }}
            />
          }
          ListHeaderComponent={
            <View style={atoms.backgroundColorWhite}>
              <TopPart>
                <JobsFilterBar {...filters} />
              </TopPart>
            </View>
          }
          keyExtractor={(item) => item.id.toString()}
          data={tasks}
          estimatedItemSize={100}
          renderItem={({ item }) => <JobItem task={item} onPress={() => openTask(item)} />}
          onEndReached={() => {
            if (!fetching && canLoadMore && tasks.length) onLoadMore()
          }}
          onEndReachedThreshold={0.2}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: "100%" }
})

export default HomeTaskerJobsList
