// useTaskDetails.js
// The task on the task details screen (a tasker looking at a task; the screen loads it): who posted it, whether the user
// takes part in it (sees the full address), whether they may offer, and the checks before asking or
// offering (a verified tasker account, the accepted terms).
import { useEffect, useLayoutEffect } from "react"
import { useNavigation } from "@react-navigation/native"

import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useAlert from "../useAlert"
import useEvent from "../useEvent"
import { translate } from "../../Helpers/language.utils"
import { explainUnverifiedTasker } from "../../stores/alerts"
import { smallAvatar } from "../../Helpers/pictures"

// offer statuses of a tasker taking part in the task (accepted onwards)
const TAKING_PART = [1, 2, 3, 5, 7, 8, 9]

const useTaskDetails = (task) => {
  const navigation = useNavigation()
  const user = useAuthStore((state) => state.user)
  const userSelect = useAuthStore((state) => state.userSelect)
  const { requestNewTime } = useModalStore.getState()
  const { showError } = useAlert()

  const userId = user.userData.id
  const poster = task.posted_by_user || (task.posted_by && task.posted_by.full_name ? task.posted_by : {})
  const posterAvatar = smallAvatar(task.posted_by_user) || task.posted_by?.avatar
  const takesPart = task.posted_by === userId || (task.offers || []).some((offer) => offer.user_id === userId && TAKING_PART.includes(offer.status))
  const canOffer = task.status === 0 && !task.offered && task.posted_by !== userId
  const unverifiedTasker = userSelect === "TASKER" && user.loggedIn && !user.userData?.verifications?.verified_tasker

  // the other side proposed a new time: the accept/decline modal opens
  const promptNewTime = useEvent(() => {
    const proposed = task.proposed_time && task.proposed_time[0]
    if (!proposed || !proposed.user_id || proposed.user_id === userId) return
    requestNewTime({
      acceptedBy: { id: task.accepted_by_user.id, fullName: task.accepted_by_user.full_name, avatar: task.accepted_by_user.avatar },
      taskId: task.id,
      taskName: task.name,
      type: "new-task-time",
      date: [proposed.date + " " + proposed.start, proposed.date + " " + proposed.end],
      timeId: proposed
    })
  })
  useLayoutEffect(() => {
    promptNewTime()
  }, [task, promptNewTime])

  // an unverified tasker is sent to add their documents (asked once, when the details open)
  const warnUnverified = useEvent(() => {
    if (!unverifiedTasker) return
    explainUnverifiedTasker(() => navigation.navigate("Profile", { navigationLicences: true }))
  })
  useEffect(() => {
    warnUnverified()
  }, [warnUnverified])

  const notVerified = () => showError("useTaskDetails.yourTaskerAccountIsNotVerified", translate("useTaskDetails.pleaseMakeSureThatYourAccount") + ".")

  return {
    task,
    poster,
    posterAvatar,
    takesPart,
    // a tasker account may ask the client about an open task
    canAsk: user.userData.type !== "CLIENT" && task.status === 0,
    canOffer,
    // the offer form is kept mounted while the task is open to others
    offerOpen: task.status === 0 && task.posted_by !== userId,
    // true when the user may go on (else they are told why not)
    mayAsk: () => {
      if (!unverifiedTasker) return true
      notVerified()
      return false
    },
    mayOffer: (agreement) => {
      if (unverifiedTasker) {
        notVerified()
        return false
      }
      if (!agreement) {
        showError("useTaskDetails.agrementIssue", "useTaskDetails.pleaseAcceptAgrementBeforeProposingAn")
        return false
      }
      return true
    }
  }
}

export default useTaskDetails
