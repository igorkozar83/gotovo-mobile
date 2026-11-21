// FinishedTasks.js
// My Tasks, FINISHED tab: finished and canceled tasks with the other party, the dates and the user's
// rating of them. A task opens its details.
import React from "react"
import { StyleSheet } from "react-native"

import MyTaskFinishedItem from "./MyTaskFinishedItem"
import MyTasksTopPart, { MY_TASKS_HEADER_HEIGHT } from "./MyTasksTopPart"
import { NoTasks } from "./CurrentTasks"
import CollapsingList from "../lists/CollapsingList"
import { palette } from "../../styles/palette"

/**
 * tasks, fetching, canLoadMore, onLoadMore, noTasks: the list; openTask(task, screen)
 * screen / setScreen: the My Tasks tabs
 */
const FinishedTasks = ({ screen, setScreen, userSelect, language, tasks, fetching, canLoadMore, onLoadMore, noTasks, openTask }) => (
  <CollapsingList
    header={<MyTasksTopPart userSelect={userSelect} screen={screen} setScreen={setScreen} />}
    headerHeight={MY_TASKS_HEADER_HEIGHT}
    background={palette.white}
    listStyle={styles.list}
    fetching={fetching}
    canLoadMore={canLoadMore}
    onLoadMore={onLoadMore}
    onEndReachedThreshold={0.5}
    extraData={[language, tasks.length]}
    data={tasks}
    estimatedItemSize={100}
    keyExtractor={(item, index) => `finished-task-${item.id}-${index}`}
    renderItem={({ item }) => <MyTaskFinishedItem task={item} onPress={() => openTask(item, "TASKDETAILFINISHED")} />}
    ListEmptyComponent={() => (noTasks ? <NoTasks what="FINISHED" /> : null)}
  />
)

const styles = StyleSheet.create({
  list: { width: "100%" }
})

export default FinishedTasks
