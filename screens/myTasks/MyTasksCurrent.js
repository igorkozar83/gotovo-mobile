// MyTasksCurrent.js
// My Tasks, CURRENT tab: the user's active tasks; one opens its details. Loads while it is shown.
import React from "react"
import { useIsFocused } from "@react-navigation/native"

import CurrentTasks from "../../components/myTasks/CurrentTasks"
import useListSpinner from "../../hooks/useListSpinner"
import { useMyTasksList } from "../../hooks/queries/useMyTasks"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { myTasksRoute } from "./myTasksTabs"
import { useOpenMyTask } from "../../hooks/queries/useDetails"

export default function MyTasksCurrent({ navigation }) {
  const openMyTask = useOpenMyTask()
  const isFocused = useIsFocused()
  const userSelect = useAuthStore((state) => state.userSelect)
  const language = useUiStore((state) => state.language)

  const list = useMyTasksList(userSelect, false, isFocused)
  useListSpinner(isFocused && list.isFetching)

  return (
    <CurrentTasks
      screen="CURRENTONE"
      setScreen={(key) => navigation.navigate(myTasksRoute(key))}
      userSelect={userSelect}
      language={language}
      tasks={list.tasks}
      fetching={list.isFetching}
      canLoadMore={list.canLoadMore}
      onLoadMore={list.loadMore}
      noTasks={list.noTasks}
      openTask={openMyTask}
    />
  )
}
