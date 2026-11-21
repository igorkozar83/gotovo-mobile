// CurrentTasks.js
// My Tasks, CURRENT tab: the user's active tasks (a client's posted tasks, a tasker's accepted ones)
// with their progress. A task opens its details.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import MyTaskCurrentItem from "./MyTaskCurrentItem"
import MyTasksTopPart, { MY_TASKS_HEADER_HEIGHT } from "./MyTasksTopPart"
import CollapsingList from "../lists/CollapsingList"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

// "no tasks posted / accepted / finished yet"
const NO_TASKS = { POSTED: "NO TASKS POSTED YET", ACCEPTED: "NO TASKS ACCEPTED YET", FINISHED: "NO TASKS FINISHED YET" }

export const NoTasks = ({ what }) => (
  <View style={styles.emptyBlock}>
    <Text style={styles.empty}>{translate(NO_TASKS[what])}</Text>
  </View>
)

/**
 * tasks, fetching, canLoadMore, onLoadMore, noTasks: the list; openTask(task): its details
 * screen / setScreen: the My Tasks tabs
 */
const CurrentTasks = ({ screen, setScreen, userSelect, language, tasks, fetching, canLoadMore, onLoadMore, noTasks, openTask }) => {
  return (
    <CollapsingList
      header={<MyTasksTopPart userSelect={userSelect} screen={screen} setScreen={setScreen} />}
      headerHeight={MY_TASKS_HEADER_HEIGHT}
      clampFrom={-250}
      background={palette.white}
      fetching={fetching}
      canLoadMore={canLoadMore}
      onLoadMore={onLoadMore}
      extraData={[language]}
      data={tasks}
      estimatedItemSize={100}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MyTaskCurrentItem task={item} onPress={() => openTask(item)} />}
      ListEmptyComponent={() => (noTasks ? <NoTasks what={userSelect === "CLIENT" ? "POSTED" : "ACCEPTED"} /> : null)}
    />
  )
}

const styles = StyleSheet.create({
  emptyBlock: { width: "100%", marginTop: 200 },
  empty: { fontFamily: "Montserrat_700Bold", fontSize: 22, textAlign: "center" }
})

export default CurrentTasks
