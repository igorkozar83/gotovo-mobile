import { act } from "@testing-library/react-native"

import useAcceptOffer, { needsAgreement } from "../taskOffer/useAcceptOffer"
import useTaskOfferActions from "../taskOffer/useTaskOfferActions"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import useModalStore from "../../stores/modalStore"
import { renderHookWithQuery, makeQueryClient } from "../../testUtils/render"
import { refused } from "../../testUtils/api"
import { acceptTaskOffer, acceptTaskDate, cancelOffer, cancelTask } from "../../Services/TasksAPI"
import { hideAlert } from "../../stores/alerts"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
jest.mock("../../Services/TasksAPI", () => ({
  acceptTaskOffer: jest.fn(),
  acceptTaskDate: jest.fn(),
  cancelOffer: jest.fn(),
  cancelTask: jest.fn(),
  completeTask: jest.fn(),
  newTaskDateTasker: jest.fn(),
  startTask: jest.fn(),
  acceptRevision: jest.fn(),
  refuseRevision: jest.fn()
}))

const offerOf = (task = {}, offer = {}) => ({
  id: 30,
  status: 0,
  edit_id: null,
  user: { id: 7 },
  task: {
    id: 9,
    status: 0,
    times: [
      { id: 1, status: 0 },
      { id: 2, status: 0 }
    ],
    offers: [],
    posted_by_user: { id: 6 },
    ...task
  },
  ...offer
})
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
// the shown offer, in the query cache the hooks read
let client
const showOffer = (offer) => {
  client = makeQueryClient()
  client.setQueryData(["taskOffer", offer.id], offer)
}
const shown = () => client.getQueryData(["taskOffer", 30])
const hook = (fn) => renderHookWithQuery(fn, { client })

beforeEach(() => {
  jest.clearAllMocks()
  useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type: "CLIENT" } }, userSelect: "CLIENT" })
  useUiStore.setState({ spinners: 0 })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
  showOffer(offerOf())
  jest.spyOn(console, "log").mockImplementation(() => {})
})

describe("accepting an offer", () => {
  it("needs the agreement, except for a revision on a task still open for offers", () => {
    expect(needsAgreement(offerOf())).toBe(true)
    expect(needsAgreement(offerOf({ status: 1 }, { edit_id: 4 }))).toBe(false)
    expect(needsAgreement(offerOf({ status: 0 }, { edit_id: 4 }))).toBe(true)
  })

  it("without the agreement it asks for it and sends nothing", async () => {
    const onAccepted = jest.fn()
    const { result } = await hook(() => useAcceptOffer({ offerId: 30, agreed: false, onAccepted }))
    await act(async () => result.current())
    expect(acceptTaskOffer).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, type: "error", text: "Please accept agreement first" })
  })

  it("accepts it, shows it accepted and reloads the offers and the inbox count", async () => {
    acceptTaskOffer.mockResolvedValue({ accepted_time: { id: 2 } })
    const onAccepted = jest.fn()
    const { result } = await hook(() => useAcceptOffer({ offerId: 30, agreed: true, onAccepted }))
    const invalidate = jest.spyOn(client, "invalidateQueries")
    await act(async () => result.current())

    expect(acceptTaskOffer).toHaveBeenCalledWith(30)
    expect(onAccepted).toHaveBeenCalledWith({ id: 2 })
    expect(shown().status).toBe(1)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["inboxCount"] })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["inbox", "offers"] })
    expect(useUiStore.getState().spinners).toBe(0)
  })

  it("a task without an agreed time is accepted with none", async () => {
    acceptTaskOffer.mockResolvedValue({ accepted_time: null })
    const onAccepted = jest.fn()
    const { result } = await hook(() => useAcceptOffer({ offerId: 30, agreed: true, onAccepted }))
    await act(async () => result.current())
    expect(onAccepted).toHaveBeenCalledWith(null)
  })

  it("a refusal shows the server's error and changes nothing", async () => {
    acceptTaskOffer.mockRejectedValue(refused(422, "refused", "Offer is no longer valid"))
    const onAccepted = jest.fn()
    const { result } = await hook(() => useAcceptOffer({ offerId: 30, agreed: true, onAccepted }))
    await act(async () => result.current())
    expect(onAccepted).not.toHaveBeenCalled()
    expect(shown().status).toBe(0)
    expect(alert()).toMatchObject({ open: true, type: "error", text: "Offer is no longer valid" })
  })

  it("a failed request shows an error and stops the spinner", async () => {
    acceptTaskOffer.mockRejectedValue(new Error("Network Error"))
    const { result } = await hook(() => useAcceptOffer({ offerId: 30, agreed: true, onAccepted: jest.fn() }))
    await act(async () => result.current())
    expect(alert()).toMatchObject({ open: true, type: "error" })
    expect(useUiStore.getState().spinners).toBe(0)
  })
})

describe("the offer's task", () => {
  const actionsFor = (props = {}) => hook(() => useTaskOfferActions({ offerId: 30, acceptedDate: null, selectedDate: null, onOfferCanceled: jest.fn(), ...props }))

  it("accepting a time needs a picked time that is not already fixed", async () => {
    const picked = await actionsFor()
    await act(async () => picked.result.current.doAcceptDate())
    expect(alert()).toMatchObject({ text: "Please choose time" })
    // the user closes it
    await act(async () => hideAlert())

    const fixed = await actionsFor({ acceptedDate: { id: 1 }, selectedDate: { id: 1 } })
    await act(async () => fixed.result.current.doAcceptDate())
    expect(alert()).toMatchObject({ text: "Time already accepted for this task" })
    expect(acceptTaskDate).not.toHaveBeenCalled()
  })

  it("an accepted time is marked accepted on the screen", async () => {
    acceptTaskDate.mockResolvedValue(undefined)
    const { result } = await actionsFor({ selectedDate: { id: 2 } })
    await act(async () => result.current.doAcceptDate())
    expect(acceptTaskDate).toHaveBeenCalledWith(2)
    expect(shown().task.times).toEqual([
      { id: 1, status: 0 },
      { id: 2, status: 1 }
    ])
  })

  it("a client cancels the task after confirming", async () => {
    cancelTask.mockResolvedValue(undefined)
    const { result } = await actionsFor()
    await act(async () => result.current.doCancelOffer())
    expect(alert()).toMatchObject({ open: true, title: "Task cancelation" })
    await act(async () => alert().proceedAction())
    expect(cancelTask).toHaveBeenCalledWith(9)
    expect(cancelOffer).not.toHaveBeenCalled()
  })

  it("a tasker cancels their offer, which then counts as canceled even when refused", async () => {
    useAuthStore.setState({ userSelect: "TASKER" })
    cancelOffer.mockRejectedValue(refused(422, "refused", "Too late"))
    const onOfferCanceled = jest.fn()
    const { result } = await actionsFor({ onOfferCanceled })
    await act(async () => result.current.doCancelOffer())
    expect(alert()).toMatchObject({ title: "Offer cancelation" })
    await act(async () => alert().proceedAction())
    expect(cancelOffer).toHaveBeenCalledWith(30)
    expect(onOfferCanceled).toHaveBeenCalled()
  })

  it("a tasker's withdrawn offer is shown canceled by them at once (status and notice)", async () => {
    useAuthStore.setState({ userSelect: "TASKER" })
    cancelOffer.mockResolvedValue(undefined)
    const onOfferCanceled = jest.fn()
    const { result } = await actionsFor({ onOfferCanceled })
    await act(async () => result.current.doCancelOffer())
    await act(async () => alert().proceedAction())
    expect(shown()).toMatchObject({ id: 30, status: 4, canceled_by: "tasker" })
    expect(onOfferCanceled).toHaveBeenCalled()
  })

  it("messaging opens the chat with the other side", async () => {
    showOffer(offerOf({ accepted_by_user: { id: 7 } }))
    const { result } = await actionsFor()
    await act(async () => result.current.goToMessageUser())
    expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 7, taskId: 9 })
  })
})
