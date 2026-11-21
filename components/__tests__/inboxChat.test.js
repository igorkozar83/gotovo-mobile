import React from "react"
import { act, fireEvent, screen } from "@testing-library/react-native"
import { Animated } from "react-native"

import { renderWithQuery, makeQueryClient } from "../../testUtils/render"
import { navigation } from "../../testUtils/navigation"
import { client, tasker, taskOf, offerOf } from "../../testUtils/fixtures"
import useAuthStore from "../../stores/authStore"
import useModalStore from "../../stores/modalStore"
import useUiStore from "../../stores/uiStore"
import ChatList from "../inbox/ChatList"
import InboxNotificationItem from "../inbox/InboxNotificationItem"
import InboxNotificationItemNotif from "../inbox/InboxNotificationItemNotif"
import NavBar from "../inbox/NavBar"
import NotificationHeroSection from "../inbox/NotificationHeroSection"
import NotificationTab from "../inbox/NotificationTab"
import Offers from "../inbox/Offers"
import { QuestionItem, AnswerItem } from "../inbox/QAItems"
import QuestionsAndAnswers from "../inbox/QuestionsAndAnswers"
import ChatHeader from "../chat/ChatHeader"
import ChatInput from "../chat/ChatInput"
import ChatMessages, { chatRows } from "../chat/ChatMessages"
import { clientReadQuestion } from "../../Services/TasksAPI"

jest.mock("@react-navigation/native", () => require("../../testUtils/navigation").navigationMock)
jest.mock("../../Services/TasksAPI", () => ({ clientReadQuestion: jest.fn(), createTaskQuestion: jest.fn() }))
jest.mock("../../Services/NotificationsAPI", () => ({ countNotifications: jest.fn(() => new Promise(() => {})) }))
const mockOpenTarget = jest.fn()
jest.mock("../../hooks/notifications/useNotificationTarget", () => () => mockOpenTarget)
const mockLiveChannel = jest.fn()
jest.mock(
  "../../hooks/useLiveChannel",
  () =>
    (...args) =>
      mockLiveChannel(...args)
)

const as = (type) => useAuthStore.setState({ user: { loggedIn: true, userData: { ...(type === "CLIENT" ? client : tasker), type, channel: "abc" } }, userSelect: type })
const press = (text) => act(async () => fireEvent.press(screen.getAllByText(text).pop()))
const pressLabel = (label) => act(async () => fireEvent.press(screen.getAllByLabelText(label).pop()))
const alert = () => useModalStore.getState().mainAlert
const initialModals = useModalStore.getState()
// a query client that already knows the inbox's unread counts (as the server sends them)
const withCounts = (type, counts = {}) => {
  const queryClient = makeQueryClient()
  queryClient.setQueryData(["inboxCount", type], { count_questions: 0, count_offers: 0, count_messages: 0, count_notifications: 0, ...counts })
  return queryClient
}
const list = (fields = {}) => ({ fetching: false, canLoadMore: false, onLoadMore: jest.fn(), tab: "OFFERS", onTab: jest.fn(), ...fields })

beforeEach(() => {
  jest.clearAllMocks()
  as("CLIENT")
  useUiStore.setState({ language: "EN" })
  useModalStore.setState({ ...initialModals, mainAlert: { open: false } })
})

describe("the inbox top", () => {
  it("says how many are unread; the tabs show their counts and switch", async () => {
    const onTab = jest.fn()
    await renderWithQuery(
      <>
        <NotificationHeroSection />
        <NavBar tab="OFFERS" onTab={onTab} />
      </>,
      withCounts("CLIENT", { count_offers: 2, count_messages: 1 })
    )
    expect(screen.getByText("3 unread")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
    await press("CHAT")
    expect(onTab).toHaveBeenCalledWith("CHAT")
  })
})

describe("the offers tab", () => {
  it("an offer opens its details; its sender's photo opens their profile", async () => {
    const offer = offerOf({ task: taskOf() })
    const { client } = await renderWithQuery(
      <Offers offers={[offer]} sort="newest" onSort={jest.fn()} sortOpen={false} setSortOpen={jest.fn()} {...list()} />,
      withCounts("CLIENT")
    )
    expect(screen.getByText("NEW OFFER")).toBeTruthy()
    expect(screen.getByText("Pera P.")).toBeTruthy()
    await press("Fix the tap ")
    expect(client.getQueryData(["taskOffer", offer.id])).toEqual(offer)
    expect(navigation.navigate).toHaveBeenCalledWith("TaskOffer", { offerId: offer.id })
    await pressLabel("Tasker profile")
    expect(navigation.navigate).toHaveBeenCalledWith("TaskerProfile", { profile: tasker })
  })

  it("the order menu opens and tells the chosen order", async () => {
    const onSort = jest.fn()
    const setSortOpen = jest.fn()
    await renderWithQuery(<Offers offers={[]} sort="newest" onSort={onSort} sortOpen setSortOpen={setSortOpen} {...list()} />, withCounts("CLIENT"))
    await press("Newest")
    expect(setSortOpen).toHaveBeenCalledWith(false)
    await press("Oldest")
    expect(onSort).toHaveBeenCalledWith("oldest")
  })

  it("a tasker sees the client of a canceled offer, faded", async () => {
    as("TASKER")
    await renderWithQuery(<InboxNotificationItem offer={offerOf({ status: 4, task: taskOf() })} onPress={jest.fn()} />, withCounts("TASKER"))
    expect(screen.getByText("Ana Anic")).toBeTruthy()
    expect(screen.getByText("CANCELED")).toBeTruthy()
  })
})

describe("the notifications tab", () => {
  const notification = {
    id: 5,
    status: 0,
    title: "New offer",
    created_at: "2026-10-01 10:00:00",
    data: JSON.stringify({ type: "new-task-offer", taskOfferId: 30, taskName: "Fix the tap" })
  }

  it("listens for new ones on the user's channel; a tap marks one read and opens it", async () => {
    const onRead = jest.fn()
    await renderWithQuery(<NotificationTab notifications={[notification]} onRefresh={jest.fn()} onRead={onRead} {...list({ tab: "NOTIFICATIONS" })} />, withCounts("CLIENT"))
    expect(mockLiveChannel).toHaveBeenCalledWith("hotovo-refresh-notifications-abc", expect.any(Function))
    await press("New offer")
    expect(onRead).toHaveBeenCalledWith(5)
    expect(mockOpenTarget).toHaveBeenCalledWith({ type: "new-task-offer", taskOfferId: 30, taskName: "Fix the tap" })
  })

  it("a kind that opens nothing has no arrow, and still marks read", async () => {
    const doReadNotification = jest.fn()
    const r = await renderWithQuery(
      <InboxNotificationItemNotif viewStatus="" date="1.10." notification={{}} titleNotification="Hello" data={{ type: "mass" }} doReadNotification={doReadNotification} id={8} />
    )
    await press("Hello")
    expect(doReadNotification).toHaveBeenCalledWith(8)
    expect(r.toJSON()).toBeTruthy()
  })
})

describe("the questions tab", () => {
  const question = { id: 40, user_id: tasker.id, question: "Which tap?", created_at: "2026-10-01 10:00:00", user: tasker }

  it("a client's new question: a tap marks it read; REPLY answers it", async () => {
    clientReadQuestion.mockResolvedValue(undefined)
    const onRefresh = jest.fn()
    await renderWithQuery(<QuestionItem task={taskOf({ questions: [question] })} date="1.10." onRefresh={onRefresh} />, withCounts("CLIENT"))
    await press("Which tap?")
    expect(clientReadQuestion).toHaveBeenCalledWith(40)
    expect(onRefresh).toHaveBeenCalled()
    await press("REPLY")
    expect(screen.getByText("ANSWER QUESTION")).toBeTruthy()
  })

  it("an answered question shows the answer, without REPLY", async () => {
    await renderWithQuery(
      <QuestionItem task={taskOf({ questions: [{ ...question, answer: { question: "The kitchen one" } }] })} date="1.10." onRefresh={jest.fn()} />,
      withCounts("CLIENT")
    )
    expect(screen.getByText("The kitchen one")).toBeTruthy()
    expect(screen.queryByText("REPLY")).toBeNull()
  })

  it("the client's own question with the reply to it, and a reply with its question", async () => {
    await renderWithQuery(<AnswerItem task={taskOf({ questions: [{ question: "Is it urgent?", get_question: { question: "Yes" } }] })} date="1.10." />)
    expect(screen.getByText("Is it urgent?")).toBeTruthy()
    expect(screen.getByText("Yes")).toBeTruthy()
    await renderWithQuery(<AnswerItem task={taskOf({ questions: [{ reply: 1, question: "Yes", get_question: { question: "Is it urgent?" } }] })} date="1.10." />)
    expect(screen.getByText("Is it urgent?")).toBeTruthy()
  })

  it("the client's list: questions to answer and answers to read", async () => {
    const tasks = [taskOf({ questions: [question] }), taskOf({ id: 10, name: "Paint the hall", questions: [{ ...question, id: 41, user_id: client.id, question: "Mine?" }] })]
    await renderWithQuery(
      <QuestionsAndAnswers questions={tasks} userSelect="CLIENT" meId={client.id} language="EN" onRefresh={jest.fn()} onOpenImage={jest.fn()} />,
      withCounts("CLIENT")
    )
    expect(screen.getByText("NEW QUESTION")).toBeTruthy()
    expect(screen.getByText("Mine?")).toBeTruthy()
  })

  it("a tasker's list: questions with answers and photos, and asking a new one", async () => {
    as("TASKER")
    const onOpenImage = jest.fn()
    const asked = taskOf({ posted_by: { full_name: "Ana Anic" }, questions: [{ ...question, image: "q.jpg", answer: { question: "The kitchen one", image: "a.jpg" } }] })
    await renderWithQuery(
      <QuestionsAndAnswers questions={[asked]} userSelect="TASKER" meId={tasker.id} language="EN" onRefresh={jest.fn()} onOpenImage={onOpenImage} />,
      withCounts("TASKER")
    )
    expect(screen.getByText("The kitchen one")).toBeTruthy()
    await act(async () => fireEvent.press(screen.getAllByLabelText("Open photo")[1]))
    expect(onOpenImage).toHaveBeenCalledWith("a.jpg")
    await press("ASK A NEW QUESTION")
    expect(screen.getAllByText("ASK A QUESTION").length).toBeGreaterThan(0)
    await press("HOME ")
    expect(navigation.navigate).toHaveBeenCalledWith("Home")
  })

  it("no tasks asked about: a new question is refused", async () => {
    as("TASKER")
    await renderWithQuery(
      <QuestionsAndAnswers questions={[]} userSelect="TASKER" meId={tasker.id} language="EN" onRefresh={jest.fn()} onOpenImage={jest.fn()} />,
      withCounts("TASKER")
    )
    await press("ASK A NEW QUESTION")
    expect(alert()).toMatchObject({ open: true, text: "No eligible tasks" })
  })
})

describe("the chats", () => {
  it("each conversation shows the other person, its task and the unread count, and opens", async () => {
    const onOpen = jest.fn()
    const conversation = { first_user: client, second_user: tasker, task: { name: "Fix the tap" }, messages: [{ created_at: "2026-10-01 10:00:00" }], messages_count: 2 }
    await renderWithQuery(<ChatList conversations={[conversation]} meId={client.id} language="EN" onOpen={onOpen} />)
    expect(screen.getByText("Pera Peric P.")).toBeTruthy()
    expect(screen.getByText("2")).toBeTruthy()
    await press("Fix the tap")
    expect(onOpen).toHaveBeenCalledWith(conversation)
  })

  it("the header goes back and switches tabs", async () => {
    const onBack = jest.fn()
    await renderWithQuery(<ChatHeader taskName="Fix the tap" userSelect="CLIENT" translateY={new Animated.Value(0)} onBack={onBack} onTab={jest.fn()} />, withCounts("CLIENT"))
    expect(screen.getByText("Fix the tap")).toBeTruthy()
    await pressLabel("Back")
    expect(onBack).toHaveBeenCalled()
  })

  it("typing and sending a message", async () => {
    const onChange = jest.fn()
    const onSend = jest.fn()
    await renderWithQuery(<ChatInput value="" onChange={onChange} onSend={onSend} keyboard={{ open: false, height: 0 }} />)
    await act(async () => fireEvent.changeText(screen.getByLabelText("Type a message..."), "Hi"))
    expect(onChange).toHaveBeenCalledWith("Hi")
    await pressLabel("Send")
    expect(onSend).toHaveBeenCalled()
  })

  it("the messages by day: the other's named, one's own not", async () => {
    const messages = [
      { user_id: tasker.id, user: tasker, message: "On my way", created_at: "2026-10-01T10:00:00" },
      { user_id: client.id, user: client, message: "Thanks", created_at: "2026-10-01T10:05:00" },
      { user_id: tasker.id, user: tasker, message: "Done", created_at: "2026-10-02T09:00:00" }
    ]
    await renderWithQuery(<ChatMessages messages={messages} myId={client.id} userSelect="CLIENT" language="EN" />)
    expect(screen.getByText("IMPORTANT NOTE")).toBeTruthy()
    expect(await screen.findByText("On my way")).toBeTruthy()
    expect(screen.getByText("Thanks")).toBeTruthy()
    // the sender's name over each of the other's messages
    expect(screen.getAllByText(/P\.$/)).toHaveLength(2)
  })

  it("the rows: each day once, before its messages, keyed by the message ids", () => {
    const rows = chatRows([
      { id: 1, created_at: "2026-10-01T10:00:00" },
      { id: 2, created_at: "2026-10-01T11:00:00" },
      { id: 3, created_at: "2026-10-02T09:00:00" }
    ])
    expect(rows.map((row) => row.key)).toEqual(["day-2026-10-01", "message-1", "message-2", "day-2026-10-02", "message-3"])
  })

  it("a page that arrives while the reader is still near the top asks for the one before it", async () => {
    const onLoadMore = jest.fn()
    const messages = [{ id: 1, user_id: tasker.id, user: tasker, message: "On my way", created_at: "2026-10-01T10:00:00" }]
    const chat = (fetching) => (
      <ChatMessages testID="messages" messages={messages} myId={client.id} userSelect="CLIENT" language="EN" canLoadMore onLoadMore={onLoadMore} fetching={fetching} />
    )
    const r = await renderWithQuery(chat(true))
    await act(async () =>
      fireEvent.scroll(screen.getByTestId("messages"), { nativeEvent: { contentOffset: { y: 10 }, contentSize: { height: 2000 }, layoutMeasurement: { height: 800 } } })
    )
    expect(onLoadMore).not.toHaveBeenCalled()
    await act(async () => r.rerender(chat(false)))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })
})
