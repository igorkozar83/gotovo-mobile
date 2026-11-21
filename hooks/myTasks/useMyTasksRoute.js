// useMyTasksRoute.js
// What a navigation to My Tasks asks for (screens/MyTasks), each time it comes: refresh (the current
// tasks, reloaded), type "finished" (that tab), submitReview (the finished tab, reloaded, with the review
// popup), taskdetails / taskdetailsFinished (a task's id, from an offer: its tab, then its details).
// Also: the lists reload when the server says the user's tasks changed.
import { useLayoutEffect } from "react"

import useLiveChannel from "../useLiveChannel"
import useEvent from "../useEvent"
import useAuthStore from "../../stores/authStore"

/**
 * params: the route's; navigation: the My Tasks screen's (its tabs are reached through it)
 * invalidateMyTasks(userSelect?, finished?): reloads lists; onSubmitReview(data): opens the review popup
 */
const useMyTasksRoute = ({ params, navigation, isFocused, userSelect, invalidateMyTasks, onSubmitReview }) => {
  // once per navigation to My Tasks (each brings new params, cleared once handled); the body sees the
  // latest props (useEvent)
  const applyParams = useEvent(() => {
    if (!params) return
    if (params.refresh) {
      invalidateMyTasks(userSelect, false)
      navigation.navigate("MyTasksCurrent")
    }
    if (params.type === "finished") navigation.navigate("MyTasksFinished")
    if (params.submitReview) {
      invalidateMyTasks(userSelect, true)
      navigation.navigate("MyTasksFinished")
      onSubmitReview(params.submitReview)
    }
    if (params.taskdetails) {
      navigation.navigate("MyTasksCurrent")
      navigation.navigate("MyTaskDetails", { taskId: params.taskdetails })
    }
    if (params.taskdetailsFinished) {
      navigation.navigate("MyTasksFinished")
      navigation.navigate("MyTaskFinished", { taskId: params.taskdetailsFinished })
    }
    // handled: off the route, so a later change of its params can't ask again
    if (params.refresh || params.type || params.submitReview || params.taskdetails || params.taskdetailsFinished) {
      navigation.setParams({ refresh: undefined, type: undefined, submitReview: undefined, taskdetails: undefined, taskdetailsFinished: undefined })
    }
  })
  useLayoutEffect(() => {
    applyParams()
  }, [params, applyParams])

  const channel = useAuthStore((state) => state.user.userData.channel)
  useLiveChannel(channel && "hotovo-refresh-tasks-" + channel, () => invalidateMyTasks())
}

export default useMyTasksRoute
