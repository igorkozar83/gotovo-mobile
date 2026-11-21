// modalStore.js
// The app-wide alert and the global modals (components/ModalManager renders them). `modals` holds
// { open, data } per modal name (a closed modal keeps its data while it slides out).
// One modal at a time: a modal asked for while any modal of the app is on the screen, or still sliding
// out, waits in `modalQueue` and opens once the screen is clear (ModalFrame tells when a modal shows and
// when it has gone: iOS cannot present a modal while another one is leaving). The request* actions open
// the task modals the way the app always has (a task to confirm only for a client, ...).
import { create } from "zustand"

import { withSetters } from "./fields"
import useAuthStore from "./authStore"
import { userBrief } from "../Helpers/taskStatus"

const useModalStore = create((set, get) => ({
  ...withSetters(set, {
    // callers spread the current alert into the next one, so this first value is kept as it always was
    mainAlert: {
      open: false,
      showClose: false,
      type: "success",
      title: "Alert",
      text: "",
      okText: "OK",
      okAction: () => {},
      cancelText: "CANCEL",
      proceedText: "PROCCEED",
      proceedAction: () => {}
    }
  }),
  // the alerts waiting for the one shown to close (stores/alerts)
  alertQueue: [],

  modals: {}, // name -> { open, data }
  modalQueue: [], // [{ name, data }] waiting for the screen to clear
  framesOnScreen: 0, // the app's modals shown or still leaving (ModalFrame)

  // over: it opens on top of the modal it belongs to (forgot password over the login), without waiting
  openModal: (name, data = {}, { over = false } = {}) =>
    set((state) => {
      const open = { modals: { ...state.modals, [name]: { open: true, data } } }
      if (over || state.modals[name]?.open) return open
      if (state.framesOnScreen > 0 || Object.values(state.modals).some((modal) => modal.open)) {
        return { modalQueue: [...state.modalQueue.filter((waiting) => waiting.name !== name), { name, data }] }
      }
      return open
    }),
  closeModal: (name) =>
    set((state) => ({
      modals: state.modals[name] ? { ...state.modals, [name]: { ...state.modals[name], open: false } } : state.modals,
      modalQueue: state.modalQueue.filter((waiting) => waiting.name !== name)
    })),

  // ModalFrame: a modal came on the screen / has gone from it (the next waiting one opens when none is left)
  frameShown: () => set((state) => ({ framesOnScreen: state.framesOnScreen + 1 })),
  frameGone: () => {
    set((state) => ({ framesOnScreen: Math.max(0, state.framesOnScreen - 1) }))
    const { framesOnScreen, modalQueue, modals } = get()
    if (framesOnScreen > 0 || !modalQueue.length || Object.values(modals).some((modal) => modal.open)) return
    const [next, ...rest] = modalQueue
    set({ modalQueue: rest, modals: { ...modals, [next.name]: { open: true, data: next.data } } })
  },

  // the tasker claimed the task complete: a client confirms it
  requestConfirmTask: (task) => {
    if (!task || !task.id || useAuthStore.getState().userSelect !== "CLIENT") return
    const times = Array.isArray(task.times) ? task.times : []
    const data = {
      acceptedTime: times.filter((time) => time.status === 1).pop() || null,
      taskName: task.name,
      taskId: task.id,
      task,
      user: task.accepted_by_user,
      postedBy: userBrief(task.posted_by_user),
      acceptedBy: userBrief(task.accepted_by_user)
    }
    get().openModal("confirmComplete", data)
  },

  // the tasker started the task: the client confirms the start
  requestStartedTask: (data) => {
    if (data) get().openModal("startedTask", data)
  },

  // the other side proposed a new time for a task
  requestNewTime: (data) => {
    if (data && data.timeId) get().openModal("newTime", data)
  },

  requestDispute: (data) => {
    if (data) get().openModal("dispute", data)
  },

  // a revised offer to answer ({ open, data }, as the callers pass it)
  requestOfferSent: (value) => {
    if (value && value.open) get().openModal("offerSent", value.data)
  },

  requestReviewReceived: (data) => {
    if (data) get().openModal("reviewReceived", data)
  }
}))

export default useModalStore
