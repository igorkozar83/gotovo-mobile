import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"

import { renderWithQuery } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client, tasker, taskOf, offerOf, timeOf, acceptedTask, finishedTask } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import TabNavigation from "../myTasks/TabNavigation"
import MyTasksHero from "../myTasks/MyTasksHero"
import MyTaskCurrentItem from "../myTasks/MyTaskCurrentItem"
import MyTaskFinishedItem from "../myTasks/MyTaskFinishedItem"
import CurrentTasks from "../myTasks/CurrentTasks"
import FinishedTasks from "../myTasks/FinishedTasks"
import TaskStepper from "../myTasks/TaskStepper"
import { RescheduleLink, ConfirmCompleteButton, CancelTask } from "../myTasks/TaskActions"
import FinishedTaskButtons from "../myTasks/FinishedTaskButtons"
import TaskerDates from "../myTasks/TaskerDates"
import LeftDateRightTime from "../myTasks/LeftDateRightTime"
import TaskerOfferCard from "../myTasks/TaskerOfferCard"
import TaskDetailsClient from "../myTasks/TaskDetailsClient"
import TaskDetailsFinished from "../myTasks/TaskDetailsFinished"
import FinishedRating from "../myTasks/FinishedRating"
import CustomCalendar from "../myTasks/CustomCalendar"
import { createReview } from "../../Services/TasksAPI"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/TasksAPI", () => ({ createReview: jest.fn() }))

const asRole = (type, id = type === "CLIENT" ? client.id : tasker.id) => useAuthStore.setState({ user: { loggedIn: true, userData: { id, type } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
const list = (fields = {}) => ({
  userSelect: "CLIENT",
  language: "EN",
  tasks: [],
  fetching: false,
  canLoadMore: false,
  onLoadMore: jest.fn(),
  noTasks: false,
  openTask: jest.fn(),
  setScreen: jest.fn(),
  ...fields
})

beforeEach(() => {
  jest.clearAllMocks()
  asRole("CLIENT")
  useUiStore.setState({ language: "EN" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
})

describe("the My Tasks header", () => {
  it("the tabs switch the screen", async () => {
    const setScreen = jest.fn()
    await renderWithQuery(<TabNavigation screen="CURRENTONE" setScreen={setScreen} />)
    await press("FINISHED")
    expect(setScreen).toHaveBeenCalledWith("FINISHED")
    await press("CALENDAR")
    expect(setScreen).toHaveBeenCalledWith("CALENDAR")
  })

  it("the hero titles the list, or the task when there is one", async () => {
    await renderWithQuery(<MyTasksHero userSelect="CLIENT" />)
    expect(screen.getByText("MyMyTasks")).toBeTruthy()
    await renderWithQuery(<MyTasksHero userSelect="TASKER" task={taskOf({ sub_category_task: { image: "a.png", image_task_details: "b.png" } })} />)
    expect(screen.getByText("TaskMyTasks")).toBeTruthy()
  })
})

describe("the rows", () => {
  it("an open task with offers says how many came in; it opens on a tap", async () => {
    const onPress = jest.fn()
    await renderWithQuery(<MyTaskCurrentItem task={taskOf({ offers: [offerOf(), offerOf({ id: 31 })] })} onPress={onPress} />)
    expect(screen.getByText("Fix the tap")).toBeTruthy()
    expect(screen.getByText(/^2 /)).toBeTruthy()
    await press("Fix the tap")
    expect(onPress).toHaveBeenCalled()
  })

  it("a finished task shows the tasker and the client's stars", async () => {
    await renderWithQuery(<MyTaskFinishedItem task={finishedTask({ reviews: [{ user_id: client.id, four_star: 1 }] })} onPress={jest.fn()} />)
    expect(screen.getByText("Pera Peric")).toBeTruthy()
    expect(screen.getByLabelText("Rating: 4/5")).toBeTruthy()
  })

  it("a tasker sees the client of a canceled task, without stars", async () => {
    asRole("TASKER")
    await renderWithQuery(<MyTaskFinishedItem task={taskOf({ status: 4, accepted_by_user: tasker })} onPress={jest.fn()} />)
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    expect(screen.queryByLabelText(/Rating/)).toBeNull()
  })
})

describe("the lists", () => {
  it("the current tasks list each task, and one opens on a tap", async () => {
    const openTask = jest.fn()
    const task = taskOf()
    await renderWithQuery(<CurrentTasks screen="CURRENTONE" {...list({ tasks: [task], openTask })} />)
    await press("Fix the tap")
    expect(openTask).toHaveBeenCalledWith(task)
  })

  it("no current task: the client is told none was posted, the tasker none accepted", async () => {
    await renderWithQuery(<CurrentTasks screen="CURRENTONE" {...list({ noTasks: true })} />)
    expect(screen.getByText("NO TASKS POSTED YET")).toBeTruthy()
    await renderWithQuery(<CurrentTasks screen="CURRENTONE" {...list({ noTasks: true, userSelect: "TASKER" })} />)
    expect(screen.getByText("NO TASKS ACCEPTED YET")).toBeTruthy()
  })

  it("a finished task opens on its finished details", async () => {
    const openTask = jest.fn()
    const task = finishedTask()
    await renderWithQuery(<FinishedTasks screen="FINISHED" {...list({ tasks: [task], openTask })} />)
    await press("Fix the tap")
    expect(openTask).toHaveBeenCalledWith(task, "TASKDETAILFINISHED")
  })

  it("no finished task says so", async () => {
    await renderWithQuery(<FinishedTasks screen="FINISHED" {...list({ noTasks: true })} />)
    expect(screen.getByText("NO TASKS FINISHED YET")).toBeTruthy()
  })
})

describe("the task's pieces", () => {
  it("the stepper labels each step and dates the ones that have a date", async () => {
    const steps = [
      { icon: "taskPosted", title: ["TASK", "POSTED"], active: true, date: "30.09" },
      { icon: "scheduled", title: ["SCHEDULED"], active: false }
    ]
    await renderWithQuery(<TaskStepper steps={steps} />)
    expect(screen.getByText("TASK\nPOSTED")).toBeTruthy()
    expect(screen.getByText("30.09")).toBeTruthy()
    expect(screen.getByText("SCHEDULED")).toBeTruthy()
  })

  it("the client's actions call back", async () => {
    const onPress = jest.fn()
    const onCancel = jest.fn()
    await renderWithQuery(
      <>
        <RescheduleLink onPress={onPress} />
        <ConfirmCompleteButton onPress={onPress} />
        <CancelTask withNote onCancel={onCancel} />
      </>
    )
    await press("Do you need to change this task's time?")
    await press("CONFIRM COMPLETE")
    expect(onPress).toHaveBeenCalledTimes(2)
    expect(screen.getByText("NOTE:")).toBeTruthy()
    await press("CANCEL THIS TASK")
    expect(onCancel).toHaveBeenCalled()
  })

  it("a finished task's buttons: the original task, and the offers for the client only", async () => {
    const openTaskDetails = jest.fn()
    const viewOffers = jest.fn()
    await renderWithQuery(<FinishedTaskButtons userSelect="CLIENT" openTaskDetails={openTaskDetails} viewOffers={viewOffers} />)
    await press("VIEW ORIGINAL TASK")
    expect(openTaskDetails).toHaveBeenCalledWith(true)
    await press("VIEW RECEIVED OFFERS")
    expect(viewOffers).toHaveBeenCalled()
    await renderWithQuery(<FinishedTaskButtons userSelect="TASKER" openTaskDetails={openTaskDetails} viewOffers={viewOffers} />)
    expect(screen.queryByText("VIEW RECEIVED OFFERS")).toBeNull()
  })

  it("a tasker picks one of the proposed dates", async () => {
    const onSelect = jest.fn()
    const times = [timeOf(), timeOf({ id: 2, date: "2026-10-06" })]
    const colors = { textColor: "#000", bgColor: "#f80" }
    await renderWithQuery(<TaskerDates task={taskOf({ times })} isTasker selectable onSelect={onSelect} colors={colors} language="EN" />)
    expect(screen.getByText("CLIENT PROPOSED DATES:")).toBeTruthy()
    const radios = screen.getAllByRole("radio")
    expect(radios).toHaveLength(2)
    await act(async () => fireEvent.press(radios[1]))
    expect(onSelect).toHaveBeenCalledWith(times[1])
  })

  it("once a date is accepted only that one shows", async () => {
    await renderWithQuery(<TaskerDates task={taskOf()} acceptedTime={timeOf({ status: 1 })} isTasker colors={{ textColor: "#000", bgColor: "#f80" }} language="EN" />)
    expect(screen.getByText("SCHEDULED DATE:")).toBeTruthy()
    expect(screen.queryAllByRole("radio")).toHaveLength(0)
  })

  it("a day and a time", async () => {
    await renderWithQuery(<LeftDateRightTime dateNumber="5" dateText="Oct" year="2026" time="10:00" />)
    expect(screen.getByText("5")).toBeTruthy()
    expect(screen.getByText("10:00")).toBeTruthy()
  })

  it("the tasker's offer card: the task, the client and the price", async () => {
    await renderWithQuery(<TaskerOfferCard task={taskOf()} offer={offerOf()} client={client} />)
    expect(screen.getByText("Fix the tap")).toBeTruthy()
    expect(screen.getByText("4")).toBeTruthy()
  })
})

describe("the client's task details", () => {
  const actions = () => ({ openTaskDetails: jest.fn(), viewOffers: jest.fn(), goToMessageUser: jest.fn(), doAcceptRevision: jest.fn(), doDeclineRevision: jest.fn() })

  it("an open task without offers: waiting for them", async () => {
    await renderWithQuery(<TaskDetailsClient task={taskOf()} taskProgress="wait" language="EN" {...actions()} />)
    expect(screen.getByText("Waiting for taskers to send offers")).toBeTruthy()
    expect(screen.queryByText("VIEW RECEIVED OFFERS")).toBeNull()
  })

  it("a scheduled task: the accepted offer, a message to the tasker and the time", async () => {
    const handlers = actions()
    await renderWithQuery(<TaskDetailsClient task={acceptedTask()} taskProgress="scheduled" language="EN" {...handlers} />)
    expect(screen.getByText("ACCEPTED OFFER:")).toBeTruthy()
    expect(screen.getByText("TASK SCHEDULED FOR:")).toBeTruthy()
    await press("SEND MESSAGE")
    expect(handlers.goToMessageUser).toHaveBeenCalled()
    await press("VIEW RECEIVED OFFERS")
    expect(handlers.viewOffers).toHaveBeenCalled()
  })

  it("a revision to answer", async () => {
    const handlers = actions()
    const task = acceptedTask({ offers: [offerOf({ status: 1 }), offerOf({ id: 31, edit_id: 30, price: "3000.00", explanation: "More pipes" })] })
    await renderWithQuery(<TaskDetailsClient task={task} taskProgress="revised" language="EN" {...handlers} />)
    expect(screen.getByText("More pipes")).toBeTruthy()
    await press("ACCEPT REVISON")
    expect(handlers.doAcceptRevision).toHaveBeenCalled()
    await press("Refuse revision")
    expect(handlers.doDeclineRevision).toHaveBeenCalled()
  })

  it("a canceled task can be posted again; a disputed one says so", async () => {
    await renderWithQuery(<TaskDetailsClient task={taskOf({ status: 4, dispute: { status: 1 } })} taskProgress="canceled" language="EN" {...actions()} />)
    expect(screen.getByText(/UNDER DISPUTE/)).toBeTruthy()
    await press("POST THIS TASK AGAIN")
    expect(navigation.navigate).toHaveBeenCalledWith("PostTask", { repost: 9 })
  })
})

describe("a finished task's details", () => {
  const draw = (task, userSelect = "CLIENT") =>
    renderWithQuery(<TaskDetailsFinished taskDetails={task} userSelect={userSelect} openTaskDetails={jest.fn()} viewOffers={jest.fn()} onReviewSubmitted={jest.fn()} />)

  it("the client sees the accepted offer, when it was completed and the review form", async () => {
    await draw(finishedTask())
    expect(screen.getAllByText("Fix the tap").length).toBeGreaterThan(0)
    expect(screen.getByText("ACCEPTED OFFER:")).toBeTruthy()
    expect(screen.getByText("TASK COMPLETED:")).toBeTruthy()
    expect(screen.getByText("Please share with others what was your experience like with this tasker")).toBeTruthy()
    await press("POST THIS TASK AGAIN")
    expect(navigation.navigate).toHaveBeenCalledWith("PostTask", { repost: 9 })
  })

  it("a canceled task says who canceled it and why", async () => {
    asRole("TASKER")
    await draw(taskOf({ status: 4, accepted_by_user: tasker, offers: [offerOf({ status: 4, cancel_explanation: "Ill" })] }), "TASKER")
    expect(screen.getByText("TASK CANCELED:")).toBeTruthy()
    expect(screen.getByText("Ill")).toBeTruthy()
    expect(screen.queryByText("POST THIS TASK AGAIN")).toBeNull()
  })

  it("a resolved dispute says in whose favour", async () => {
    await draw(finishedTask({ dispute: { status: 3 } }))
    expect(screen.getByText(/RESOLVED IN FAVOUR OF/)).toBeTruthy()
    expect(screen.getByText(/TASKER/)).toBeTruthy()
  })
})

describe("rating a finished task", () => {
  it("an incomplete review is not sent", async () => {
    await renderWithQuery(<FinishedRating task={finishedTask()} userSelect="CLIENT" onReviewSubmitted={jest.fn()} />)
    await press("SUBMIT REVIEW")
    expect(createReview).not.toHaveBeenCalled()
    expect(alert()).toMatchObject({ open: true, title: "Task review create error" })
  })

  it("a sent review is confirmed; closing that refreshes the task", async () => {
    createReview.mockResolvedValue(undefined)
    const onReviewSubmitted = jest.fn()
    await renderWithQuery(<FinishedRating task={finishedTask()} userSelect="CLIENT" onReviewSubmitted={onReviewSubmitted} />)
    await act(async () => fireEvent.press(screen.getByLabelText("Rate 5")))
    await act(async () => fireEvent.changeText(screen.getByLabelText("MY REVIEW"), "Great"))
    await press("SUBMIT REVIEW")
    expect(createReview).toHaveBeenCalledWith({ task_id: 9, receiver_user_id: tasker.id, rate: 5, message: "Great" }, [], undefined)
    expect(screen.getByText("YOUR REVIEW HAS BEEN SUBMITTED.")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getAllByLabelText("Close").pop()))
    expect(onReviewSubmitted).toHaveBeenCalled()
  })

  it("a written review is shown instead of the form", async () => {
    await renderWithQuery(
      <FinishedRating
        task={finishedTask({ reviews: [{ user_id: client.id, four_star: 1, message: "Quick", created_at: "2026-10-05 13:00:00" }] })}
        userSelect="CLIENT"
        onReviewSubmitted={jest.fn()}
      />
    )
    expect(screen.getByText("YOUR REVIEW:")).toBeTruthy()
    expect(screen.getByLabelText("Rating: 4/5")).toBeTruthy()
    expect(screen.getByText("Quick")).toBeTruthy()
    expect(screen.queryByText("SUBMIT REVIEW")).toBeNull()
  })

  it("nothing to rate without a finished offer", async () => {
    await renderWithQuery(<FinishedRating task={taskOf({ status: 4 })} userSelect="CLIENT" onReviewSubmitted={jest.fn()} />)
    expect(screen.queryByText("SUBMIT REVIEW")).toBeNull()
  })
})

describe("the calendar", () => {
  it("lists the other party of each task on its day", async () => {
    // today on the device's clock (the calendar shows the current month in local time)
    const now = new Date()
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")
    const calendar = [{ date: today + " 10:00:00", task: { status: 1, accepted_by_user: tasker, posted_by_user: client } }]
    await renderWithQuery(<CustomCalendar calendar={calendar} loadingCal={false} userSelect="CLIENT" />)
    expect(screen.getByText(/Pera/)).toBeTruthy()
  })

  it("a task in progress stays on its day", async () => {
    const now = new Date()
    const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-")
    const calendar = [{ date: today + " 10:00:00", task: { status: 9, accepted_by_user: tasker, posted_by_user: client } }]
    await renderWithQuery(<CustomCalendar calendar={calendar} loadingCal={false} userSelect="CLIENT" />)
    expect(screen.getByText(/Pera/)).toBeTruthy()
  })
})
