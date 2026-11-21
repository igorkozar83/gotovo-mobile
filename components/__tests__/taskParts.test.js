import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { Linking } from "react-native"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client, tasker, taskOf, offerOf, timeOf, acceptedTask } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import AboutTask from "../taskDetails/AboutTask"
import { AskQuestionButton, ProposeOffer } from "../taskDetails/OfferActions"
import PartyCard from "../taskDetails/PartyCard"
import ScheduledTimeRow from "../taskDetails/ScheduledTimeRow"
import { TaskHero, PosterSummary } from "../taskDetails/TaskHeader"
import TaskMediaGrid from "../taskDetails/TaskMediaGrid"
import TaskPlace from "../taskDetails/TaskPlace"
import TaskQuestions from "../taskDetails/TaskQuestions"
import TaskTimes from "../taskDetails/TaskTimes"
import TaskerTaskDetails from "../taskDetails/TaskerTaskDetails"
import CancellationNotice from "../taskOffer/CancellationNotice"
import OfferCard from "../taskOffer/OfferCard"
import OfferDecision from "../taskOffer/OfferDecision"
import ScheduledInfoBlock from "../taskOffer/ScheduledInfoBlock"
import TaskActionPanel from "../taskOffer/TaskActionPanel"
import PriceTag from "../offer/PriceTag"
import RatingBreakdown from "../reviews/RatingBreakdown"
import MyReviewItem from "../reviews/MyReviewItem"
import ReviewList, { ReviewSortBar } from "../reviews/ReviewList"
import PaymentSummary from "../payment/PaymentSummary"
import { i18n } from "../../Helpers/language.utils"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
// the tasker's actions have their own hook test: here, which button calls which
const mockTaskerActions = { goToMessageUser: jest.fn(), proposeNewDate: jest.fn(), doCompleteTask: jest.fn(), doAcceptDate: jest.fn(), doStartTask: jest.fn() }
jest.mock("../../hooks/myTasks/useTaskerTaskActions", () => () => mockTaskerActions)

const asRole = (type) => useAuthStore.setState({ user: { loggedIn: true, userData: { id: type === "CLIENT" ? client.id : tasker.id, type } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const colors = { textColor: "#000", bgColor: "#f80" }
// a day already begun (a scheduled time that has come) and one still ahead
const PAST = "2020-01-01"
const FUTURE = "2099-01-01"

beforeEach(() => {
  jest.clearAllMocks()
  asRole("TASKER")
  useUiStore.setState({ language: "EN" })
})

describe("a task's details", () => {
  it("its facts and options: a number with its unit, a yes / no", async () => {
    const options = [
      { task_option_value: "3", task_option_info: { type: 1, description: "Rooms", unit_name: "m", unit_sup: "2" } },
      { task_option_value: "1", task_option_info: { type: 2, description: "Urgent" } },
      { task_option_value: "x", task_option_info: { type: 9, description: "Unknown" } }
    ]
    await renderWithQuery(<AboutTask task={taskOf({ sub_category_task: { description: "Plumbing" }, options })} language="EN" />)
    expect(screen.getByText("Plumbing")).toBeTruthy()
    expect(screen.getByText("The kitchen tap drips")).toBeTruthy()
    expect(screen.getByText("3")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
    expect(screen.getByRole("checkbox", { name: "Urgent" }).props.accessibilityState).toMatchObject({ checked: true })
    expect(screen.queryByText("Unknown")).toBeNull()
  })

  it("the job is named in the app's language, as the post form names it", async () => {
    i18n.store({ SR: { "Furniture assembly": "Montaža nameštaja" } })
    i18n.locale = "SR"
    try {
      await renderWithQuery(<AboutTask task={taskOf({ sub_category_task: { description: "Furniture assembly" } })} language="SR" />)
      expect(screen.getByText("Montaža nameštaja")).toBeTruthy()
    } finally {
      i18n.locale = "EN"
    }
  })

  it("the tasker asks or proposes; proposing comes with the terms", async () => {
    const onPress = jest.fn()
    const onPropose = jest.fn()
    const setAgreement = jest.fn()
    await renderWithQuery(
      <>
        <AskQuestionButton onPress={onPress} />
        <ProposeOffer agreement={false} setAgreement={setAgreement} onPropose={onPropose} />
      </>
    )
    await press("ASK A QUESTION")
    expect(onPress).toHaveBeenCalled()
    await act(async () => fireEvent.press(screen.getByRole("checkbox")))
    expect(setAgreement).toHaveBeenCalledWith(true)
    await press("PROPOSE AN OFFER")
    expect(onPropose).toHaveBeenCalled()
  })

  it("the other party's card shows a price only when given", async () => {
    await renderWithQuery(<PartyCard taskName="Fix the tap" user={tasker} name="Pera Peric" stars="4.5" count={12} price="2.500" />)
    expect(screen.getByText("Pera Peric")).toBeTruthy()
    expect(screen.getByText("2.500")).toBeTruthy()
    await renderWithQuery(<PartyCard taskName="Fix the tap" user={tasker} name="Pera Peric" stars="4.5" count={12} price={null} />)
    expect(screen.queryByText("2.500")).toBeNull()
  })

  it("a scheduled time: the hours", async () => {
    await renderWithQuery(<ScheduledTimeRow time={timeOf()} language="EN" />)
    expect(screen.getByText("10:00-12:00")).toBeTruthy()
  })

  it("the hero names an S.O.S. task; the poster is named with the last initial", async () => {
    await renderWithQuery(<TaskHero task={taskOf({ is_sos: true, sub_category_task: { image: "a.png", image_task_details: "b.png" } })} userSelect="TASKER" />)
    expect(screen.getByText("SOS taskTaskDetails")).toBeTruthy()
    await renderWithQuery(<PosterSummary poster={client} avatar={null} />)
    expect(screen.getByText("Ana A.")).toBeTruthy()
  })

  it("the poster's name and photo open their profile", async () => {
    const onOpenProfile = jest.fn()
    await renderWithQuery(<PosterSummary poster={client} avatar={null} onOpenProfile={onOpenProfile} />)
    await act(async () => fireEvent.press(screen.getByLabelText("Client profile")))
    await act(async () => fireEvent.press(screen.getByText("Ana A.")))
    expect(onOpenProfile).toHaveBeenCalledTimes(2)
  })

  it("a photo or video tile opens the original", async () => {
    const onOpen = jest.fn()
    await renderWithQuery(
      <TaskMediaGrid
        tiles={[
          { url: "t1.jpg", original: "o1.jpg" },
          { url: "t2.jpg", original: "o2.mp4", type: "video" }
        ]}
        onOpen={onOpen}
      />
    )
    const tiles = screen.getAllByLabelText("Open photo")
    expect(tiles).toHaveLength(2)
    await act(async () => fireEvent.press(tiles[1]))
    expect(onOpen).toHaveBeenCalledWith("o2.mp4")
  })

  describe("the place", () => {
    const address = { address: "Main 12, Vracar", city: "Belgrade", latitude: "44.8", longitude: "20.4" }

    it("someone not taking part sees the street without its number, and why", async () => {
      await renderWithQuery(<TaskPlace task={taskOf({ address })} takesPart={false} />)
      expect(screen.getByText("Belgrade, Main, Vracar")).toBeTruthy()
      expect(screen.getByText(/approximate location/)).toBeTruthy()
      // the map, without a pin
      expect(screen.queryByLabelText(/Belgrade/)).toBeNull()
    })

    it("someone taking part sees the full address and the instructions", async () => {
      await renderWithQuery(<TaskPlace task={taskOf({ address, additional_instructions: "Ring twice" })} takesPart />)
      expect(screen.getByText("Main 12, Vracar, Belgrade")).toBeTruthy()
      expect(screen.getByText("Ring twice")).toBeTruthy()
      expect(screen.getByText("Tap on pin for navigation")).toBeTruthy()
      const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue()
      await act(async () => fireEvent.press(screen.getByLabelText("Main 12, Vracar, Belgrade")))
      expect(openURL).toHaveBeenCalledWith(expect.stringContaining("44.8"))
    })

    it("without an address", async () => {
      await renderWithQuery(<TaskPlace task={taskOf({ address: null })} takesPart={false} />)
      expect(screen.getByText("- - - ")).toBeTruthy()
    })
  })

  it("the questions and answers, a picture opening full screen", async () => {
    const onOpenImage = jest.fn()
    const questions = [
      { user_id: 7, question: "Which tap?", image: "q.jpg", task: { posted_by: 6 } },
      { user_id: 6, question: "The kitchen one", task: { posted_by: 6 } }
    ]
    await renderWithQuery(<TaskQuestions questions={questions} onOpenImage={onOpenImage} />)
    expect(screen.getByText("Q:")).toBeTruthy()
    expect(screen.getByText("A:")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getByLabelText("Open photo")))
    expect(onOpenImage).toHaveBeenCalledWith("q.jpg")
  })

  it("no questions, no title", async () => {
    await renderWithQuery(<TaskQuestions questions={[]} onOpenImage={jest.fn()} />)
    expect(screen.queryByText("QUESTIONS & ANSWERS")).toBeNull()
  })

  it("the preferred times: only the client's with originalTimes, and whether they are flexible", async () => {
    const times = [timeOf(), timeOf({ id: 2, start: "14:00:00", end: "15:00:00", user_id: 7 })]
    await renderWithQuery(<TaskTimes task={taskOf({ times, flexible_dates: 1 })} language="EN" originalTimes />)
    expect(screen.getByText("10:00-12:00")).toBeTruthy()
    expect(screen.queryByText("14:00-15:00")).toBeNull()
    expect(screen.getByRole("checkbox", { name: "Dates are flexible:" }).props.accessibilityState).toMatchObject({ checked: true })
  })
})

describe("the tasker's active task", () => {
  const draw = (task) => renderWithQuery(<TaskerTaskDetails task={task} setTask={jest.fn()} onBackToList={jest.fn()} openTaskDetails={jest.fn()} />)

  it("before a date is accepted: pick one and accept it, or propose another", async () => {
    const task = acceptedTask({ accepted_by: tasker.id, flexible_dates: 1, times: [timeOf({ date: FUTURE }), timeOf({ id: 2, date: FUTURE })] })
    await draw(task)
    await act(async () => fireEvent.press(screen.getAllByRole("radio")[1]))
    await press("ACCEPT DATE")
    expect(mockTaskerActions.doAcceptDate).toHaveBeenCalledWith(task.times[1])
    await press("PROPOSE NEW DATE")
    expect(screen.queryByText("START TASK")).toBeNull()
  })

  it("on the day: start it, message the client, and cancel through the cancel form", async () => {
    await draw(acceptedTask({ accepted_by: tasker.id, times: [timeOf({ date: PAST, status: 1 })] }))
    await press("START TASK")
    expect(mockTaskerActions.doStartTask).toHaveBeenCalledWith("TASKER")
    await press("SEND MESSAGE")
    expect(mockTaskerActions.goToMessageUser).toHaveBeenCalled()
    await press("You need to cancel this task?")
    expect(screen.getAllByText("CANCEL TASK").length).toBeGreaterThan(0)
  })

  it("started by the client: the tasker claims it complete", async () => {
    await draw(acceptedTask({ status: 9, accepted_by: tasker.id, times: [timeOf({ date: PAST, status: 1 })] }))
    await press("CLAIM TASK COMPLETE")
    expect(mockTaskerActions.doCompleteTask).toHaveBeenCalled()
  })

  it("started by the tasker: waiting for the client; a dispute says so", async () => {
    await draw(acceptedTask({ status: 8, dispute: { status: 1 }, times: [timeOf({ date: PAST, status: 1 })] }))
    expect(screen.getByText("YOU HAVE MARKED THIS TASK AS STARTED, WAITING FOR CLIENT ACTION")).toBeTruthy()
    expect(screen.getByText(/UNDER DISPUTE/)).toBeTruthy()
  })
})

describe("an offer's details", () => {
  it("a canceled offer: by the client, or by the tasker with the reason", async () => {
    await renderWithQuery(<CancellationNotice offer={offerOf({ status: 4 })} />)
    expect(screen.getByText("TASK CANCELED BY CLIENT")).toBeTruthy()
    await renderWithQuery(<CancellationNotice offer={offerOf({ status: 4, cancel_explanation: "Ill" })} />)
    expect(screen.getByText("Ill")).toBeTruthy()
    await renderWithQuery(<CancellationNotice offer={offerOf({ status: 1 })} />)
    expect(screen.queryByText(/TASK CANCELED/)).toBeNull()
  })

  it("the card: a new offer for the client, sent for the tasker", async () => {
    await renderWithQuery(<OfferCard offer={offerOf({ task: taskOf() })} forClient language="EN" />)
    expect(screen.getByText("NEW OFFER")).toBeTruthy()
    expect(screen.getByText("Two hours")).toBeTruthy()
    await renderWithQuery(<OfferCard offer={offerOf({ task: taskOf(), explanation: null })} language="EN" />)
    expect(screen.getByText("OFFER SENT")).toBeTruthy()
  })

  describe("the decision", () => {
    const handlers = () => ({ onAgree: jest.fn(), onAccept: jest.fn(), onAcceptRevision: jest.fn(), onRefuseRevision: jest.fn(), onEdit: jest.fn() })

    it("the client accepts a new offer under the terms", async () => {
      const h = handlers()
      await renderWithQuery(<OfferDecision offer={offerOf({ task: taskOf() })} isClient agreed={false} {...h} />)
      await act(async () => fireEvent.press(screen.getByRole("checkbox")))
      expect(h.onAgree).toHaveBeenCalledWith(true)
      await press("ACCEPT OFFER")
      expect(h.onAccept).toHaveBeenCalled()
    })

    it("the client accepts or refuses a revision of an accepted task", async () => {
      const h = handlers()
      await renderWithQuery(<OfferDecision offer={offerOf({ status: 0, edit_id: 30, task: taskOf({ status: 1 }) })} isClient {...h} />)
      expect(screen.queryByRole("checkbox")).toBeNull()
      await press("ACCEPT REVISON")
      expect(h.onAcceptRevision).toHaveBeenCalled()
      await press("Refuse revision")
      expect(h.onRefuseRevision).toHaveBeenCalled()
    })

    it("the tasker edits an accepted offer once a date is set", async () => {
      const h = handlers()
      await renderWithQuery(<OfferDecision offer={offerOf({ status: 1, task: taskOf({ status: 1 }) })} accepted {...h} />)
      await press("EDIT OFFER")
      expect(h.onEdit).toHaveBeenCalled()
    })
  })

  it("the scheduled time, unless canceled", async () => {
    await renderWithQuery(<ScheduledInfoBlock offer={offerOf({ status: 1 })} accepted={timeOf({ status: 1 })} language="EN" color="#000" />)
    expect(screen.getByText("TASK SCHEDULED FOR:")).toBeTruthy()
    await renderWithQuery(<ScheduledInfoBlock offer={offerOf({ status: 4 })} accepted={timeOf({ status: 1 })} language="EN" color="#000" />)
    expect(screen.queryByText("TASK SCHEDULED FOR:")).toBeNull()
  })

  describe("the action panel", () => {
    const actions = () => ({ onAcceptDate: jest.fn(), onStart: jest.fn(), onComplete: jest.fn(), onCancel: jest.fn(), onProposeDate: jest.fn(), onMessage: jest.fn() })
    const dates = (fields = {}) => ({ selected: null, init: null, selectable: true, onSelect: jest.fn(), ...fields })
    const me = { id: tasker.id, type: "TASKER" }
    const draw = (offer, props = {}) =>
      renderWithQuery(
        <TaskActionPanel offer={offer} me={me} userSelect="TASKER" colors={colors} language="EN" accepted={false} dates={dates()} canceled={false} actions={actions()} {...props} />
      )

    it("not for those outside the task", async () => {
      await draw(offerOf({ task: taskOf() }))
      expect(screen.queryByText("CLIENT PROPOSED DATES:")).toBeNull()
    })

    it("the tasker picks a proposed date and accepts it, or proposes another", async () => {
      const a = actions()
      const d = dates()
      const task = taskOf({ status: 1, offered: true, flexible_dates: 1 })
      await draw(offerOf({ status: 1, task }), { actions: a, dates: d })
      await act(async () => fireEvent.press(screen.getAllByRole("radio")[0]))
      expect(d.onSelect).toHaveBeenCalledWith(task.times[0])
      await press("ACCEPT DATE")
      expect(a.onAcceptDate).toHaveBeenCalled()
      await press("PROPOSE NEW DATE")
      expect(a.onProposeDate).toHaveBeenCalled()
      await press("SEND MESSAGE")
      expect(a.onMessage).toHaveBeenCalled()
    })

    it("on the day the tasker starts it, and claims it complete once the client started it", async () => {
      const a = actions()
      await draw(offerOf({ status: 1, task: taskOf({ status: 1, offered: true }) }), { actions: a, accepted: timeOf({ date: PAST, status: 1 }) })
      await press("START TASK")
      expect(a.onStart).toHaveBeenCalled()
      await draw(offerOf({ status: 9, task: taskOf({ status: 9, offered: true }) }), { actions: a, accepted: timeOf({ date: PAST, status: 1 }) })
      await press("CLAIM TASK COMPLETE")
      expect(a.onComplete).toHaveBeenCalled()
    })

    it("a refused offer's tasker gets no START TASK (the task went to another tasker), nor someone else's offer", async () => {
      const accepted = timeOf({ date: PAST, status: 1 })
      await draw(offerOf({ status: 6, task: taskOf({ status: 1, offered: true }) }), { accepted })
      expect(screen.queryByText("START TASK")).toBeNull()
      await draw(offerOf({ status: 1, user_id: tasker.id + 1, task: taskOf({ status: 1, offered: true }) }), { accepted })
      expect(screen.queryByText("START TASK")).toBeNull()
      await draw(offerOf({ status: 9, user_id: tasker.id + 1, task: taskOf({ status: 9, offered: true }) }), { accepted })
      expect(screen.queryByText("CLAIM TASK COMPLETE")).toBeNull()
    })

    it("the tasker can still cancel a sent offer", async () => {
      const a = actions()
      await draw(offerOf({ status: 0, task: taskOf({ offered: true }) }), { actions: a })
      await press("Something came up, cancel offer?")
      expect(a.onCancel).toHaveBeenCalled()
    })

    it("the client cancels an accepted task here, or goes to the task for a new offer", async () => {
      asRole("CLIENT")
      const a = actions()
      const clientMe = { id: client.id, type: "CLIENT" }
      await draw(offerOf({ status: 1, task: taskOf({ status: 1, posted_by: client.id }) }), { actions: a, me: clientMe, userSelect: "CLIENT" })
      await press(/Do you need to cancel this/)
      expect(a.onCancel).toHaveBeenCalled()
      const task = taskOf({ posted_by: client.id })
      await draw(offerOf({ status: 0, task }), { actions: a, me: clientMe, userSelect: "CLIENT" })
      await press(/Do you need to cancel this/)
      expect(navigation.navigate).toHaveBeenCalledWith("MyTasks", { taskdetails: task.id })
    })

    it("no cancel on an offer the client refused, replaced or that is past cancelling", async () => {
      asRole("CLIENT")
      const clientMe = { id: client.id, type: "CLIENT" }
      for (const status of [3, 5, 6, 7]) {
        await draw(offerOf({ status, task: taskOf({ status: 1, posted_by: client.id }) }), { me: clientMe, userSelect: "CLIENT" })
        expect(screen.queryByText(/Do you need to cancel this/)).toBeNull()
      }
    })
  })
})

describe("prices and reviews", () => {
  it("a price shows with the settings' currency", async () => {
    const client = makeQueryClient()
    client.setQueryData(["appSettings"], { settings: { currency: "rsd" } })
    await renderWithQuery(<PriceTag price="2.500" />, client)
    expect(screen.getByText(/RSD/)).toBeTruthy()
  })

  it("the breakdown: each star's share and count", async () => {
    await renderWithQuery(<RatingBreakdown summary={{ total: 4, five_star: 3, four_star: 1 }} />)
    expect(screen.getByText("75%")).toBeTruthy()
    expect(screen.getByText("25%")).toBeTruthy()
  })

  it("a review without a reply offers one; a replied one shows it", async () => {
    const openReply = jest.fn()
    await renderWithQuery(<MyReviewItem reviewer="Ana A." taskName="Fix the tap" taskRating={4} reviewDescription="Fine" openReply={openReply} />)
    await press("Wish to reply to this review?")
    expect(openReply).toHaveBeenCalledWith(expect.objectContaining({ reviewer: "Ana A." }))
    await renderWithQuery(<MyReviewItem reviewer="Ana A." taskRating={4} repliedText="Thanks" repliedDate="1.10.2026" taskerProfile postedBy={6} taskPostedBy={6} />)
    expect(screen.getByText("TASKER REPLY")).toBeTruthy()
    expect(screen.getByText("Thanks")).toBeTruthy()
  })

  it("the list: each review with its photos; a photo opens", async () => {
    const onOpenImage = jest.fn()
    const reviews = [
      {
        id: 1,
        user: client,
        task: { id: 9, name: "Fix the tap" },
        four_star: 1,
        message: "Fine",
        created_at: "2026-10-01 10:00:00",
        review_images: [{ url: "r.jpg" }],
        reply: { reply: "Thanks", created_at: "2026-10-02 10:00:00" }
      }
    ]
    await renderWithQuery(<ReviewList reviews={reviews} onOpenImage={onOpenImage} itemProps={() => ({ noReply: true })} />)
    expect(screen.getByText("Fine")).toBeTruthy()
    expect(screen.getByText("Thanks")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getByLabelText("Open photo")))
    expect(onOpenImage).toHaveBeenCalledWith("r.jpg")
  })

  it("the sort menu lists the other orders and tells the chosen one", async () => {
    const onSort = jest.fn()
    await renderWithQuery(<ReviewSortBar hasReviews onSort={onSort} />)
    await press("Newest")
    await press("Best rating")
    expect(onSort).toHaveBeenCalledWith("Best rating")
    expect(screen.getByText("Best rating")).toBeTruthy()
  })

  it("no reviews: no sort menu", async () => {
    await renderWithQuery(<ReviewSortBar hasReviews={false} onSort={jest.fn()} />)
    expect(screen.queryByText("Newest")).toBeNull()
  })
})

describe("the payment table", () => {
  it("the fee for the task, and the price still to pay", async () => {
    await renderWithQuery(<PaymentSummary task={{ name: "Fix the tap" }} known price={2500} fee={200} currency="RSD" settingsCurrency="rsd" />)
    expect(screen.getByText("Gotovo service & commitment fee for Fix the tap")).toBeTruthy()
    expect(screen.getByText(/is to be paid when the task is completed/)).toBeTruthy()
  })

  it("the task price, after the fee was paid", async () => {
    await renderWithQuery(<PaymentSummary task={{ name: "Fix the tap" }} known price={2500} fee={200} taskPrice currency="RSD" settingsCurrency="rsd" />)
    expect(screen.getByText("Fix the tap")).toBeTruthy()
    expect(screen.getByText(/You have already paid the Gotovo fee of/)).toBeTruthy()
  })

  it("an offer not known yet: no amounts", async () => {
    await renderWithQuery(<PaymentSummary task={{ name: "Fix the tap" }} known={false} price={null} fee={null} currency="RSD" settingsCurrency="rsd" />)
    expect(screen.queryByText("TOTAL")).toBeNull()
  })
})
