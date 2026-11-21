// useSession.js
// Starting a session after a login or registration, ending it on this device, and the prompts a freshly
// loaded user may need: a revised offer to answer, a started task to confirm, a completed task to confirm.
import { useNavigation } from "@react-navigation/native"

import { setToken, clearToken } from "../../Services/authToken"
import { loadTaskDraft } from "../../Services/taskDraft"
import { resetToHome } from "../../RootNavigation"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import { userBrief } from "../../Helpers/taskStatus"
import { askToConfirm } from "../../stores/alerts"

const useSession = () => {
  const navigation = useNavigation()
  const setUser = useAuthStore((state) => state.setUser)
  const setUserSelect = useAuthStore((state) => state.setUserSelect)
  const requestOfferSent = useModalStore((state) => state.requestOfferSent)
  const requestStartedTask = useModalStore((state) => state.requestStartedTask)
  const requestConfirmTask = useModalStore((state) => state.requestConfirmTask)

  const showPendingTaskPrompts = (user) => {
    if (!user) return

    const revised = user.revised_active_offers && user.revised_active_offers[0]
    if (revised && revised.edited_offers?.length && revised.accepted_offer?.length) {
      requestOfferSent({
        open: true,
        data: {
          acceptedBy: revised.accepted_by_user,
          acceptedTime: revised.accepted_time,
          postedBy: revised.posted_by_user,
          task: revised,
          editedOffer: revised.edited_offers[0],
          acceptedOffer: revised.accepted_offer[0]
        }
      })
    }

    ;(user.tasks_check || []).forEach((item) => {
      // the tasker started the task: the client confirms the start
      if (item.status === 8) {
        requestStartedTask({
          type: "tasker-start-task",
          taskId: item.id,
          taskOffer: item.offer_task_check,
          taskName: item.name,
          acceptedTime: item.accepted_time[0],
          postedBy: userBrief(item.posted_by_user),
          acceptedByUser: userBrief(item.accepted_by_user)
        })
      }

      // the tasker claimed the task complete: the client confirms it
      if (item.status === 3) {
        requestConfirmTask({
          ...item,
          times: item.accepted_time,
          taskName: item.name,
          taskId: item.id,
          task: item,
          user: item.accepted_by_user,
          postedBy: userBrief(item.posted_by_user),
          acceptedBy: userBrief(item.accepted_by_user)
        })
      }
    })
  }

  // a task kept while the user registered (Services/taskDraft): go on posting it? (Not over a task prompt
  // of the sign-in: an account with work going on is not the guest's new one; the draft waits.)
  const offerTaskDraft = async (user) => {
    if (user?.revised_active_offers?.length || user?.tasks_check?.length) return
    if (!(await loadTaskDraft())) return
    askToConfirm({
      type: "success",
      title: "useSession.yourTaskIsSaved",
      text: "useSession.continuePostingTheTaskYouStarted",
      confirmText: "common.continue",
      showClose: true,
      onConfirm: () => navigation.navigate("PostTask", { draft: true })
    })
  }

  // stores the token and logs the user in
  const signIn = async (token, user) => {
    await setToken(token)
    setUser({ loggedIn: true, userData: user })
    showPendingTaskPrompts(user)
    offerTaskDraft(user)
  }

  // drops the token and shows the app logged out, from Home with every tab at its root (the server is
  // not asked: it may be unreachable)
  const signOutLocally = () => {
    clearToken()
    resetToHome()
    setUser({ loggedIn: false, userData: { reviews: [] } })
    setUserSelect("CLIENT")
  }

  return { signIn, signOutLocally, showPendingTaskPrompts }
}

export default useSession
