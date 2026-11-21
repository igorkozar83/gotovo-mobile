import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"

import { renderWithQuery } from "../../testUtils/render"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import QuestionPostedModal from "../modals/QuestionPostedModal"
import OfferSentModal from "../modals/OfferSentModal"
import SwitchToTaskerModal from "../modals/SwitchToTaskerModal"
import NewTimeProposed from "../modals/NewTimeProposed"
import TaskCompleteConfirmModal from "../modals/TaskCompleteConfirmModal"
import TaskStartedModal from "../modals/TaskStartedModal"
import DisputedModal from "../modals/DisputedModal"
import NewMessageReceived from "../modals/NewMessageReceived"
import CanceledTaskModal from "../modals/CanceledTaskModal"
import CanceledTaskByTaskerModal from "../modals/CanceledTaskByTaskerModal"
import ScheduledModal from "../modals/ScheduledModal"
import TaskConfirmedModal from "../modals/TaskConfirmedModal"
import OfferSentEditModal from "../modals/OfferSentEditModal"
import WelcomeModal from "../modals/WelcomeModal"
import AlertModal from "../modals/AlertModal"

// the answers of the prompts are their hooks' (tested in hooks/__tests__); here: what each shows and
// which answer each button gives
const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }))
const mockAnswers = { accept: jest.fn(), decline: jest.fn(), confirm: jest.fn(), deny: jest.fn(), acceptRevision: jest.fn(), declineRevision: jest.fn() }
const mockOther = { avatar: null, name: "Pera P." }
jest.mock("../../hooks/myTasks/useNewTimeAnswer", () => () => ({ accept: mockAnswers.accept, decline: mockAnswers.decline }))
jest.mock("../../hooks/myTasks/useConfirmComplete", () => () => ({ other: { ...mockOther, avatar: "https://x/a.jpg" }, confirm: mockAnswers.confirm }))
jest.mock("../../hooks/myTasks/useStartedTaskAnswer", () => () => ({ other: mockOther, confirm: mockAnswers.confirm, deny: mockAnswers.deny }))
jest.mock("../../hooks/offers/useRevisionActions", () => () => ({ acceptRevision: mockAnswers.acceptRevision, declineRevision: mockAnswers.declineRevision }))
const mockAddReminder = jest.fn()
jest.mock("../../hooks/myTasks/useTaskCalendarReminder", () => () => mockAddReminder)
const mockLoadTask = jest.fn()
jest.mock("../../hooks/queries/useLoadTask", () => () => mockLoadTask)
const mockChooseLanguage = jest.fn()
jest.mock("../../hooks/main/useLanguageSetup", () => ({ chooseLanguage: (language) => mockChooseLanguage(language) }))

const asRole = (type) => useAuthStore.setState({ user: { loggedIn: true, userData: { id: 6, type } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getByText(text)))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()

beforeEach(() => {
  jest.clearAllMocks()
  asRole("CLIENT")
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
})

describe("the badge confirmations", () => {
  it("a posted question shows the given title and message, else the default title", async () => {
    await renderWithQuery(<QuestionPostedModal visible onClose={jest.fn()} message="You will be notified." />)
    expect(screen.getByText("YOUR MESSAGE HAS BEEN SENT")).toBeTruthy()
    expect(screen.getByText("You will be notified.")).toBeTruthy()
  })

  it("a sent offer says so", async () => {
    await renderWithQuery(<OfferSentModal visible onClose={jest.fn()} />)
    expect(screen.getByText("YOUR OFFER HAS BEEN SENT")).toBeTruthy()
  })

  it("the first switch to the tasker role closes on CONTINUE", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<SwitchToTaskerModal visible onClose={onClose} />)
    await press("CONTINUE")
    expect(onClose).toHaveBeenCalled()
  })

  it("nothing shows while not visible", async () => {
    await renderWithQuery(<OfferSentModal visible={false} onClose={jest.fn()} />)
    expect(screen.queryByText("YOUR OFFER HAS BEEN SENT")).toBeNull()
  })
})

describe("the task prompts", () => {
  const time = { date: "2026-10-05", start: "10:00:00", end: "12:30:00", status: 1 }

  it("a new time: its hours, the task and the tasker; accept and decline answer it", async () => {
    await renderWithQuery(
      <NewTimeProposed
        visible
        onClose={jest.fn()}
        data={{ taskName: "Fix the tap", date: ["2026-10-05 10:00:00", "2026-10-05 12:30:00"], acceptedBy: { fullName: "Pera Peric" } }}
      />
    )
    expect(screen.getByText("NEW DATE PROPOSED")).toBeTruthy()
    expect(screen.getByText("10:00-12:30")).toBeTruthy()
    expect(screen.getByText("Fix the tap")).toBeTruthy()
    expect(screen.getByText("Pera Peric")).toBeTruthy()
    await press("ACCEPT")
    expect(mockAnswers.accept).toHaveBeenCalled()
    await press("DECLINE")
    expect(mockAnswers.decline).toHaveBeenCalled()
  })

  it("a finished task: the accepted time, the task and the tasker; TASK IS COMPLETE confirms it", async () => {
    await renderWithQuery(<TaskCompleteConfirmModal visible onClose={jest.fn()} data={{ taskName: "Fix the tap", acceptedTime: [{ ...time, status: 0 }, time] }} />)
    expect(screen.getByText("10:00-12:30")).toBeTruthy()
    expect(screen.getByText("Pera P.")).toBeTruthy()
    // the way into a dispute is switched off
    expect(screen.queryByText("Something went wrong?")).toBeNull()
    await press("TASK IS COMPLETE")
    expect(mockAnswers.confirm).toHaveBeenCalled()
  })

  it("the finished-task prompt is not drawn while closed", async () => {
    await renderWithQuery(<TaskCompleteConfirmModal visible={false} onClose={jest.fn()} data={{ taskName: "Fix the tap" }} />)
    expect(screen.queryByText("Fix the tap")).toBeNull()
  })

  it("a started task has no close button: the client says it started or not", async () => {
    await renderWithQuery(<TaskStartedModal visible onClose={jest.fn()} data={{ taskName: "Fix the tap", acceptedTime: time }} />)
    expect(screen.queryByLabelText("Close")).toBeNull()
    expect(screen.getByText("Pera P.")).toBeTruthy()
    await press("TASK STARTED")
    expect(mockAnswers.confirm).toHaveBeenCalled()
    await press("TASK NOT STARTED")
    expect(mockAnswers.deny).toHaveBeenCalled()
  })

  it("a disputed task: who disputed it and why; SEND MESSAGE opens their chat", async () => {
    asRole("TASKER")
    const onClose = jest.fn()
    await renderWithQuery(<DisputedModal visible onClose={onClose} data={{ taskId: 9, taskName: "Fix the tap", reason: "Not finished", postedBy: { id: 6, name: "Ana" } }} />)
    expect(screen.getByText("THE CLIENT OPENED A DISPUTE ABOUT THE TASK")).toBeTruthy()
    expect(screen.getByText("Not finished")).toBeTruthy()
    await press("SEND MESSAGE")
    expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 6, taskId: 9 })
    expect(onClose).toHaveBeenCalled()
  })
})

describe("the notices", () => {
  it("a new message: the sender and the message; REPLY opens the chat", async () => {
    const onClose = jest.fn()
    await renderWithQuery(
      <NewMessageReceived visible onClose={onClose} message={{ title: "New message", name: "Ana", text: "Are you coming?", type: "CLIENT", userId: 6, taskId: 9 }} />
    )
    expect(screen.getByText("Are you coming?")).toBeTruthy()
    await press("REPLY")
    expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 6, taskId: 9 })
    expect(onClose).toHaveBeenCalled()
  })

  it("a task canceled by the tasker, seen by the client: no ways onward", async () => {
    await renderWithQuery(<CanceledTaskModal visible onClose={jest.fn()} data={{ task: { type: "TASKER", taskName: "Fix the tap", name: "Pera" } }} />)
    expect(screen.getByText("TASKER HAS CANCELED THE TASK")).toBeTruthy()
    expect(screen.queryByText("SEE OTHER TASKS")).toBeNull()
  })

  it("a task canceled by the client, seen by the tasker: other tasks are a tap away", async () => {
    asRole("TASKER")
    const onClose = jest.fn()
    await renderWithQuery(<CanceledTaskModal visible onClose={onClose} data={{ task: { type: "CLIENT", taskName: "Fix the tap", name: "Ana" } }} />)
    expect(screen.getByText("CLIENT HAS CANCELED THE TASK")).toBeTruthy()
    await press("SEE OTHER TASKS")
    expect(mockNavigate).toHaveBeenCalledWith("Home")
    expect(onClose).toHaveBeenCalled()
  })

  it("a task the tasker canceled: the reason, the other offers or posting it again", async () => {
    const onClose = jest.fn()
    await renderWithQuery(<CanceledTaskByTaskerModal visible onClose={onClose} data={{ task: { taskId: 9, taskName: "Fix the tap", name: "Pera", reason: "Ill" } }} />)
    expect(screen.getByText("Ill")).toBeTruthy()
    await press("SEE OTHER OFFERS")
    expect(mockNavigate).toHaveBeenCalledWith("Notifications", { viewOffers: true, taskDetailsId: 9 })
    await press("POST THIS TASK AGAIN")
    expect(mockNavigate).toHaveBeenCalledWith("PostTask", { repost: 9 })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  describe("a task scheduled for today", () => {
    const data = {
      task_id: 9,
      task_name: "Fix the tap",
      price: "2500.00",
      time: { date: "2026-10-05", start: "10:00:00", end: "12:00:00" },
      accepted_by: { id: 7, full_name: "Pera", last_name: "Peric" },
      posted_by: { id: 6, full_name: "Ana", last_name: "Anic" }
    }

    it("shows the client the tasker and the price to have ready", async () => {
      await renderWithQuery(<ScheduledModal visible onClose={jest.fn()} data={data} currency="RSD" />)
      expect(screen.getByText("Pera Peric")).toBeTruthy()
      expect(screen.getByText(/2.500 RSD/)).toBeTruthy()
      await press("SEND MESSAGE")
      expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 7, taskId: 9 })
    })

    it("a party without a last name (the push sends none for the tasker) is not named 'undefined'", async () => {
      await renderWithQuery(<ScheduledModal visible onClose={jest.fn()} data={{ ...data, accepted_by: { id: 7, full_name: "Pera" } }} currency="RSD" />)
      expect(screen.getByText("Pera")).toBeTruthy()
      expect(screen.queryByText(/undefined/)).toBeNull()
    })

    it("shows the tasker the client", async () => {
      asRole("TASKER")
      await renderWithQuery(<ScheduledModal visible onClose={jest.fn()} data={data} currency="RSD" />)
      expect(screen.getByText("Ana Anic")).toBeTruthy()
    })

    it("VIEW TASK loads the task and opens it", async () => {
      mockLoadTask.mockResolvedValue({ id: 9, name: "Fix the tap" })
      const onClose = jest.fn()
      await renderWithQuery(<ScheduledModal visible onClose={onClose} data={data} currency="RSD" />)
      await press("VIEW TASK")
      expect(onClose).toHaveBeenCalled()
      expect(mockLoadTask).toHaveBeenCalledWith(9)
      expect(mockNavigate).toHaveBeenCalledWith("TaskDetails", { taskId: 9 })
    })

    it("a task that could not be loaded is not opened", async () => {
      mockLoadTask.mockResolvedValue(null)
      await renderWithQuery(<ScheduledModal visible onClose={jest.fn()} data={data} currency="RSD" />)
      await press("VIEW TASK")
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe("a confirmed task", () => {
    const data = { task: { id: 9, name: "Fix the tap" }, user: { full_name: "Pera Peric" }, user_id: 7 }
    const confirmedDate = { date: "2026-10-05", start: "10:00:00", end: "12:00:00" }
    const draw = (onClose = jest.fn()) => renderWithQuery(<TaskConfirmedModal visible onClose={onClose} data={data} confirmedDate={confirmedDate} />)

    it("shows the time, the task and the tasker; closing goes to My Tasks", async () => {
      const onClose = jest.fn()
      await draw(onClose)
      expect(screen.getByText("10:00-12:00")).toBeTruthy()
      expect(screen.getByText("Pera Peric")).toBeTruthy()
      await act(async () => fireEvent.press(screen.getByLabelText("Close")))
      expect(onClose).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith("MyTasks", { refresh: true })
    })

    it("VIEW TASK opens it as accepted", async () => {
      const { client } = await draw()
      await press("VIEW TASK")
      expect(client.getQueryData(["task", 9])).toEqual({ id: 9, name: "Fix the tap", status: 1 })
      expect(mockNavigate).toHaveBeenCalledWith("TaskDetails", { taskId: 9 })
    })

    it("a saved calendar event hides its button and says so", async () => {
      mockAddReminder.mockResolvedValue(true)
      await draw()
      await press("ADD TO CALENDAR")
      expect(mockAddReminder).toHaveBeenCalledWith("Fix the tap", confirmedDate)
      expect(screen.queryByText("ADD TO CALENDAR")).toBeNull()
      expect(alert()).toMatchObject({ open: true, type: "success", title: "Add date to calendar success" })
    })

    it("a refused calendar keeps the button", async () => {
      mockAddReminder.mockResolvedValue(false)
      await draw()
      await press("ADD TO CALENDAR")
      expect(screen.getByText("ADD TO CALENDAR")).toBeTruthy()
    })

    it("SEND MESSAGE opens the tasker's chat", async () => {
      await draw()
      await press("SEND MESSAGE")
      expect(mockNavigate).toHaveBeenCalledWith("Chat", { userId: 7, taskId: 9 })
    })
  })

  describe("a revised offer", () => {
    // as the revision push sends it: the new price a number, the tasker's full_name and last_name
    const data = {
      task: { id: 9, name: "Fix the tap" },
      acceptedBy: { full_name: "Jovana", last_name: "Skalušević" },
      acceptedOffer: { price: "2000.00" },
      editedOffer: { id: 31, price: 22000, explanation: "More pipes" },
      acceptedTime: null
    }

    it("shows the tasker in full, both prices whole and the reason; the client accepts or refuses it", async () => {
      await renderWithQuery(<OfferSentEditModal visible onClose={jest.fn()} data={data} />)
      expect(screen.getByText("More pipes")).toBeTruthy()
      expect(screen.getByText("Jovana Skalušević")).toBeTruthy()
      // (it read "22." before)
      expect(screen.getByText(/22\.000/)).toBeTruthy()
      expect(screen.getByText(/^2\.000/)).toBeTruthy()
      await press("ACCEPT REVISION")
      expect(mockAnswers.acceptRevision).toHaveBeenCalledWith(31)
      await press("Refuse revision")
      expect(mockAnswers.declineRevision).toHaveBeenCalledWith(31)
    })

    it("an answered revision has no buttons", async () => {
      await renderWithQuery(<OfferSentEditModal visible onClose={jest.fn()} data={{ ...data, taskOfferStatusEdited: true }} />)
      expect(screen.queryByText("ACCEPT REVISION")).toBeNull()
    })
  })
})

describe("the welcome", () => {
  it("switches the language to the other one", async () => {
    useUiStore.setState({ language: "EN" })
    await renderWithQuery(<WelcomeModal visible onVisibleChange={jest.fn()} onDone={jest.fn()} />)
    await press("SR")
    expect(mockChooseLanguage).toHaveBeenCalledWith("SR")
  })

  it("without the terms: steps aside for the alert, whose OK brings it back", async () => {
    const onVisibleChange = jest.fn()
    const onDone = jest.fn()
    await renderWithQuery(<WelcomeModal visible onVisibleChange={onVisibleChange} onDone={onDone} />)
    await press("OK")
    expect(onDone).not.toHaveBeenCalled()
    expect(onVisibleChange).toHaveBeenCalledWith(false)
    expect(alert()).toMatchObject({ open: true, text: "Please accept terms & conditions." })
    await act(async () => alert().proceedAction())
    expect(onVisibleChange).toHaveBeenLastCalledWith(true)
  })

  it("with the terms ticked, OK is done", async () => {
    const onDone = jest.fn()
    await renderWithQuery(<WelcomeModal visible onVisibleChange={jest.fn()} onDone={onDone} />)
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    await press("OK")
    expect(onDone).toHaveBeenCalled()
  })
})

describe("the alert", () => {
  const draw = (fields, onClose = jest.fn()) =>
    renderWithQuery(<AlertModal alert={{ open: true, type: "error", title: "Task error", text: "It failed.", ...fields }} onClose={onClose} />)

  it("shows the title and the text, without a close X unless asked", async () => {
    await draw({})
    expect(screen.getByText("Task error")).toBeTruthy()
    expect(screen.getByText("It failed.")).toBeTruthy()
    expect(screen.queryByLabelText("Close")).toBeNull()
  })

  it("OK closes it, then runs its action", async () => {
    const onClose = jest.fn()
    const okAction = jest.fn()
    await draw({ okText: "OK", okAction }, onClose)
    await press("OK")
    expect(onClose).toHaveBeenCalled()
    expect(okAction).toHaveBeenCalled()
  })

  it("cancel only closes it; proceed runs its action (which closes it itself)", async () => {
    const onClose = jest.fn()
    const proceedAction = jest.fn()
    await draw({ cancelText: "Cancel", proceedText: "Go on", proceedAction, showClose: true }, onClose)
    await press("Go on")
    expect(proceedAction).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    await press("Cancel")
    expect(onClose).toHaveBeenCalledTimes(1)
    await act(async () => fireEvent.press(screen.getByLabelText("Close")))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("draws in the tasker's look for a tasker", async () => {
    asRole("TASKER")
    await draw({ type: "success", okText: "OK" })
    expect(screen.getByText("OK")).toBeTruthy()
  })
})
