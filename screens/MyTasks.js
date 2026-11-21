// MyTasks.js
// My Tasks: a tab navigator of its three tabs (screens/myTasks: current, finished, calendar), one screen
// each under the same hero and tabs (MyTasksTopPart), swiped or chosen there. A tab stays where it was
// left. What a navigation here asks for (a tab, a reload, a task to open, the review popup) is
// useMyTasksRoute's; task details are their own screens (MyTaskDetails, MyTaskFinished).
import React, { useState } from "react"
import { View } from "react-native"
import { useIsFocused } from "@react-navigation/native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"

import ActivityInd from "../components/ui/ActivityInd"
import SubmitReviewPopup from "../components/modals/SubmitReviewPopup"
import MyTasksCurrent from "./myTasks/MyTasksCurrent"
import MyTasksFinished from "./myTasks/MyTasksFinished"
import MyTasksCalendar from "./myTasks/MyTasksCalendar"
import { MY_TASKS_TABS } from "./myTasks/myTasksTabs"
import useMyTasksRoute from "../hooks/myTasks/useMyTasksRoute"
import { useInvalidateMyTasks } from "../hooks/queries/useMyTasks"
import useAuthStore from "../stores/authStore"
import { atoms } from "../styles/atoms"

const Top = createMaterialTopTabNavigator()

const SCREENS = { MyTasksCurrent, MyTasksFinished, MyTasksCalendar }

const hideTabBar = () => null

// the tab a first navigation here asks for
const initialTab = (params) => (params && (params.type === "finished" || params.submitReview || params.taskdetailsFinished) ? "MyTasksFinished" : "MyTasksCurrent")

const MyTasks = ({ route, navigation }) => {
  const isFocused = useIsFocused()
  const userSelect = useAuthStore((state) => state.userSelect)
  const invalidateMyTasks = useInvalidateMyTasks()
  // the review popup (it hides while a photo prompt is up and keeps its data)
  const [review, setReview] = useState({ open: false, data: {} })

  useMyTasksRoute({
    params: route.params,
    navigation,
    isFocused,
    userSelect,
    invalidateMyTasks,
    onSubmitReview: (data) => setReview({ open: true, data })
  })

  return (
    <>
      <ActivityInd />
      <Top.Navigator tabBar={hideTabBar} initialRouteName={initialTab(route.params)} backBehavior="none" screenOptions={{ lazy: true }}>
        {MY_TASKS_TABS.map(({ route: name }) => (
          <Top.Screen key={name} name={name} component={SCREENS[name]} />
        ))}
      </Top.Navigator>
      <View style={atoms.positionAbsolute}>
        <SubmitReviewPopup visible={review.open} onClose={(open) => setReview((current) => ({ ...current, open }))} data={review.data} />
      </View>
    </>
  )
}

export default MyTasks
