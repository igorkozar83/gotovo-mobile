import useModalStore from "../modalStore"

const store = () => useModalStore.getState()
const initial = useModalStore.getState()

beforeEach(() => useModalStore.setState({ ...initial, modals: {}, modalQueue: [], framesOnScreen: 0 }))

describe("the app's modals, one at a time", () => {
  it("a modal asked for while another is on the screen waits until that one has gone", () => {
    store().openModal("startedTask", { taskId: 1 })
    store().frameShown()
    store().openModal("confirmComplete", { taskId: 2 })
    expect(store().modals.confirmComplete).toBeUndefined()

    store().closeModal("startedTask")
    expect(store().modals.confirmComplete).toBeUndefined()
    store().frameGone()
    expect(store().modals.confirmComplete).toEqual({ open: true, data: { taskId: 2 } })
  })

  it("a modal that belongs over another opens at once", () => {
    store().frameShown()
    store().openModal("forgotPassword", {}, { over: true })
    expect(store().modals.forgotPassword.open).toBe(true)
  })

  it("asking again for a waiting modal keeps one, with the newest data; closing it drops it", () => {
    store().frameShown()
    store().openModal("newMessage", { text: "Hi" })
    store().openModal("newMessage", { text: "Hi again" })
    expect(store().modalQueue).toEqual([{ name: "newMessage", data: { text: "Hi again" } }])
    store().closeModal("newMessage")
    expect(store().modalQueue).toEqual([])
  })
})
