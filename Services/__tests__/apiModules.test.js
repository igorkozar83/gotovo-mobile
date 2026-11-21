// Every API call: which client, method and URL it uses and what it sends, and what it resolves to (v2: the
// answer's data, or nothing for 204; v1: the whole answer).
import { api, publicApi, upload } from "../client"
import * as Tasks from "../TasksAPI"
import * as Users from "../UsersAPI"
import * as Auth from "../API"
import * as Payments from "../PaymentsAPI"
import * as Notifications from "../NotificationsAPI"
import { getSettings } from "../settingsAPI"

jest.mock("../client", () => {
  const client = () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() })
  return { api: client(), publicApi: client(), upload: jest.fn() }
})

// the answer's data (v2), inside the answer (v1 calls resolve to the whole answer)
const PAYLOAD = { id: 1 }
const DATA = { success: 1, data: PAYLOAD }

beforeEach(() => {
  jest.clearAllMocks()
  // the stand-in answers have no fields, so the response shape checks report them (Services/schemas)
  jest.spyOn(console, "log").mockImplementation(() => {})
  for (const client of [api, publicApi]) {
    for (const method of ["get", "post", "put", "patch", "delete"]) client[method].mockResolvedValue({ data: DATA })
  }
  upload.mockResolvedValue({ data: DATA })
})

// [name, call, client, method, url, body or params, what it resolves to: "data" | "nothing" | "answer" (a list's
// whole page { data, meta }; the payment links, which are not on v2: their v1 answer)]
const CALLS = [
  ["getTasks", () => Tasks.getTasks("c1", true), api, "get", "tasks", { params: { cursor: "c1", finished: 1 } }, "answer"],
  [
    "getTasksTasker",
    () => Tasks.getTasksTasker(null, false, true, { sort_type: "sos" }),
    api,
    "get",
    "tasks/feed",
    { params: { cursor: null, finished: 0, mine: 1, filter: { sort_type: "sos" } } },
    "answer"
  ],
  ["getTaskQuestions", () => Tasks.getTaskQuestions(9), api, "get", "tasks/9/questions", undefined, "data"],
  ["getAllTaskQuestions", () => Tasks.getAllTaskQuestions("c"), api, "get", "questions", { params: { cursor: "c" } }, "answer"],
  ["getTaskOffer", () => Tasks.getTaskOffer(30), api, "get", "offers/30", undefined, "data"],
  [
    "getTaskOffers",
    () => Tasks.getTaskOffers("c", { task_id: 9 }, { sort: "newest" }),
    api,
    "get",
    "offers",
    { params: { cursor: "c", filter: { task_id: 9 }, sort: { sort: "newest" } } },
    "answer"
  ],
  ["clientReadQuestion", () => Tasks.clientReadQuestion(4), api, "post", "questions/4/read", undefined, "nothing"],
  ["readTasksQuestionsTasker", () => Tasks.readTasksQuestionsTasker(), api, "post", "questions/read", undefined, "nothing"],
  ["createTaskOffer", () => Tasks.createTaskOffer(9, { price: 5 }), api, "post", "tasks/9/offers", { price: 5 }, "data"],
  ["editTaskOffer", () => Tasks.editTaskOffer(9, { price: 6 }), api, "post", "tasks/9/offers/revision", { price: 6 }, "data"],
  ["cancelOffer", () => Tasks.cancelOffer(30), api, "post", "offers/30/withdraw", undefined, "nothing"],
  ["cancelTask", () => Tasks.cancelTask(9), api, "post", "tasks/9/cancel", undefined, "nothing"],
  ["submitReviewReply", () => Tasks.submitReviewReply({ task_id: 9, message: "Hvala" }), api, "post", "tasks/9/review-reply", { message: "Hvala" }, "data"],
  ["getReviews", () => Tasks.getReviews("c", "Oldest", 6, 1), api, "get", "reviews", { params: { cursor: "c", sort: "Oldest", user_id: 6, user_type: 1 } }, "answer"],
  ["acceptTaskDate", () => Tasks.acceptTaskDate(2), api, "post", "times/2/accept", undefined, "nothing"],
  ["completeTask", () => Tasks.completeTask(9), api, "post", "tasks/9/complete", undefined, "nothing"],
  ["newTaskDateTasker", () => Tasks.newTaskDateTasker(30, ["a", "b"]), api, "post", "offers/30/times", { date: ["a", "b"] }, "data"],
  ["actionTaskTime accept", () => Tasks.actionTaskTime(9, 1), api, "post", "times/9/accept-proposal", undefined, "nothing"],
  ["actionTaskTime decline", () => Tasks.actionTaskTime(9, 3), api, "post", "times/9/decline-proposal", undefined, "nothing"],
  ["acceptRevision", () => Tasks.acceptRevision(31), api, "post", "offers/31/accept-revision", undefined, "nothing"],
  ["refuseRevision", () => Tasks.refuseRevision(31), api, "post", "offers/31/refuse-revision", undefined, "nothing"],
  ["getTaskById", () => Tasks.getTaskById(9), api, "get", "tasks/9", undefined, "data"],
  ["getTaskInfoByTimeId", () => Tasks.getTaskInfoByTimeId(2), api, "get", "times/2/task", undefined, "data"],
  ["cancelTaskTasker", () => Tasks.cancelTaskTasker(30, "sick"), api, "post", "offers/30/cancel", { reason: "sick" }, "nothing"],
  ["startTask", () => Tasks.startTask("TASKER", 30), api, "post", "offers/30/start", { type: "TASKER" }, "nothing"],
  ["confirmCompleteTask", () => Tasks.confirmCompleteTask(9), api, "post", "tasks/9/confirm-complete", undefined, "nothing"],
  ["taskNotStarted", () => Tasks.taskNotStarted(30), api, "post", "offers/30/not-started", undefined, "nothing"],
  ["acceptTaskOffer", () => Tasks.acceptTaskOffer(30), api, "post", "offers/30/accept", undefined, "data"],

  ["deleteAvatar", () => Users.deleteAvatar(), api, "delete", "me/avatar", undefined, "nothing"],
  ["updateProfile", () => Users.updateProfile({ about: "Hi" }), api, "patch", "me", { about: "Hi" }, "data"],
  ["deleteUserImage", () => Users.deleteUserImage(3), api, "delete", "me/documents/3", undefined, "nothing"],
  ["getAddress", () => Users.getAddress({ latitude: 44, longitude: 20 }), api, "get", "geocode", { params: { latitude: 44, longitude: 20 } }, "data"],
  ["addUserAddress", () => Users.addUserAddress({ city: "BG" }), api, "post", "me/addresses", { city: "BG" }, "data"],
  ["editUserAddress", () => Users.editUserAddress({ id: 2, city: "NS" }), api, "patch", "me/addresses/2", { city: "NS" }, "data"],
  ["removeUserAddress", () => Users.removeUserAddress(2), api, "delete", "me/addresses/2", undefined, "nothing"],
  ["updateUserType", () => Users.updateUserType(1), api, "put", "me/type", { type: 1 }, "nothing"],
  ["updateExpoPushToken", () => Users.updateExpoPushToken("tok"), api, "put", "me/push-token", { expo_push_token: "tok" }, "nothing"],
  ["removePhone", () => Users.removePhone(), api, "delete", "me/phone", undefined, "nothing"],
  ["requestEmailVerification", () => Users.requestEmailVerification(), api, "post", "me/email-verification", undefined, "nothing"],
  ["updateLanguage", () => Users.updateLanguage("SR"), api, "put", "me/language", { lang: "SR" }, "nothing"],

  ["login", () => Auth.login("a@b.rs", "pw"), publicApi, "post", "auth/login", { email: "a@b.rs", password: "pw" }, "data"],
  ["register", () => Auth.register({ email: "a@b.rs" }), publicApi, "post", "auth/register", { email: "a@b.rs" }, "data"],
  ["logout", () => Auth.logout(), api, "post", "auth/logout", undefined, "nothing"],
  ["loginGoogle", () => Auth.loginGoogle("g", "CLIENT", "SR"), publicApi, "post", "auth/google", { access_token: "g", type: "CLIENT", lang: "SR" }, "data"],
  [
    "loginApple",
    () => Auth.loginApple({ t: 1 }, 0, "Ana", "Anić", "SR"),
    publicApi,
    "post",
    "auth/apple",
    { data: { t: 1 }, name: "Ana", last_name: "Anić", type: 0, lang: "SR" },
    "data"
  ],
  ["loginFacebook", () => Auth.loginFacebook("f", "TASKER", "EN"), publicApi, "post", "auth/facebook", { access_token: "f", type: "TASKER", lang: "EN" }, "data"],
  ["updatePassword", () => Auth.updatePassword("n", "n", "o"), api, "put", "me/password", { new_password: "n", confirm_new_password: "n", old_password: "o" }, "nothing"],
  ["user", () => Auth.user(), api, "get", "me", undefined, "data"],
  ["sendVerifySms", () => Auth.sendVerifySms("381"), api, "post", "me/phone/verification", { to: "381" }, "nothing"],
  ["checkVerifySms", () => Auth.checkVerifySms("381", "1234"), api, "post", "me/phone/verify", { to: "381", code: "1234" }, "nothing"],
  ["requestResetPassword", () => Auth.requestResetPassword("a@b.rs"), publicApi, "post", "auth/password-reset", { email: "a@b.rs" }, "nothing"],

  ["createPaymentLinkForTaskPrice", () => Payments.createPaymentLinkForTaskPrice(9), api, "get", "payments/payment-start-task-payment/9"],
  ["createPaymentLink", () => Payments.createPaymentLink(30), api, "get", "payments/payment-fee-get-url/30"],
  ["storeBankAccount", () => Payments.storeBankAccount({ iban: "RS1" }), api, "post", "me/bank-accounts", { iban: "RS1" }, "data"],
  ["removeCardInfo", () => Payments.removeCardInfo(1), api, "delete", "me/cards/1", undefined, "nothing"],
  ["removeBankInfo", () => Payments.removeBankInfo(1), api, "delete", "me/bank-accounts/1", undefined, "nothing"],

  ["countNotifications", () => Notifications.countNotifications(), api, "get", "inbox/counts", undefined, "data"],
  ["checkConversation", () => Notifications.checkConversation(7, 9), api, "post", "conversations", { user_id: 7, task_id: 9 }, "data"],
  ["sendMessage", () => Notifications.sendMessage(3, "Zdravo"), api, "post", "conversations/3/messages", { message: "Zdravo" }, "data"],
  ["readMessages", () => Notifications.readMessages(3), api, "post", "conversations/3/read", undefined, "nothing"],
  ["getConversations", () => Notifications.getConversations("c"), api, "get", "conversations", { params: { cursor: "c" } }, "answer"],
  ["getNotifications", () => Notifications.getNotifications("c", 20), api, "get", "notifications", { params: { cursor: "c", per_page: 20 } }, "answer"],
  ["getMessages", () => Notifications.getMessages(3, "c"), api, "get", "conversations/3/messages", { params: { cursor: "c", per_page: 30 } }, "answer"],
  ["readNotification", () => Notifications.readNotification(5), api, "post", "notifications/5/read", undefined, "nothing"],
  ["getCalendar", () => Notifications.getCalendar(), api, "get", "calendar", undefined, "data"],
  ["getSettings", () => getSettings(), publicApi, "get", "settings", undefined, "data"]
]

const RESOLVES = { data: PAYLOAD, nothing: undefined, answer: DATA }

describe.each(CALLS)("%s", (name, call, client, method, url, sent, returns = "answer") => {
  it(`${method.toUpperCase()} ${url}`, async () => {
    await expect(call()).resolves.toBe(RESOLVES[returns])
    const args = [url]
    if (sent !== undefined) args.push(sent)
    expect(client[method]).toHaveBeenCalledWith(...args)
  })
})

describe("uploads", () => {
  // React Native's FormData keeps its parts in _parts; the test environment's FormData doesn't
  const RealFormData = global.FormData
  beforeAll(() => {
    global.FormData = class {
      _parts = []
      append(key, value) {
        this._parts.push([key, value])
      }
    }
  })
  afterAll(() => {
    global.FormData = RealFormData
  })

  const sentForm = () => upload.mock.calls[0][1]
  const partsOf = (form) => form._parts

  it("a task goes as multipart with its photos and video and reports progress in %", async () => {
    const progress = jest.fn()
    await Tasks.createTask(
      { name: "Ormar" },
      [
        { type: "image", uri: "file:///a/p.jpg" },
        { type: "video", uri: "file:///a/v.mp4" },
        { type: "other", uri: "x" }
      ],
      progress
    )
    expect(upload.mock.calls[0][0]).toBe("tasks")
    expect(partsOf(sentForm())).toEqual([
      ["files[]", { uri: "file:///a/p.jpg", name: "p.jpg", type: "image/jpg" }],
      ["files[]", { uri: "file:///a/v.mp4", name: "v.mp4", type: "video/mp4" }],
      ["name", "Ormar"]
    ])
    upload.mock.calls[0][2]({ loaded: 50, total: 200 })
    expect(progress).toHaveBeenCalledWith(25)
  })

  it("a question may have a photo and answer another question", async () => {
    await Tasks.createTaskQuestion({ question: "Kada?" }, 9, { uri: "file:///q.png" }, null, 4)
    expect(upload.mock.calls[0][0]).toBe("tasks/9/questions")
    expect(partsOf(sentForm())).toEqual([
      ["image", { uri: "file:///q.png", name: "q.png", type: "image/png" }],
      ["question", "Kada?"],
      ["question_id", 4]
    ])
    // no progress callback: nothing to report to
    expect(() => upload.mock.calls[0][2]({ loaded: 1, total: 2 })).not.toThrow()
  })

  it("a review and a dispute upload their photos", async () => {
    await Tasks.createReview({ rate: 5 }, [{ type: "image", uri: "file:///r.jpg" }])
    await Tasks.disputeTask({ taskId: 9, reason: "late" }, [])
    expect(upload.mock.calls.map((c) => c[0])).toEqual(["reviews", "tasks/9/dispute"])
  })

  it("avatar and profile images", async () => {
    await Users.uploadImage({ uri: "file:///me.jpg" })
    await Users.uploadUserImage({ uri: "file:///doc.png" })
    expect(upload.mock.calls.map((c) => [c[0], partsOf(c[1])[0][0]])).toEqual([
      ["me/avatar", "avatar"],
      ["me/documents", "image"]
    ])
  })
})
