import { checkData, loginSchema, userSchema, tasksPageSchema, offersPageSchema, inboxCountSchema, notificationsPageSchema, conversationsPageSchema } from "../schemas"
import { reportError } from "../../Helpers/reportError"

jest.mock("../../Helpers/reportError", () => ({ reportError: jest.fn() }))

// shapes as the API v2 answers them (the data of trimmed copies of real answers)
const user = {
  id: 6,
  type: "CLIENT",
  channel: "3f9a",
  name: "Ana",
  last_name: "Anić",
  email: "ana@example.rs",
  phone_verified: 1,
  addresses: [{ id: 5 }],
  verifications: {}
}
const NO_MORE = { next_cursor: null }
const ANSWERS = [
  [loginSchema, { access_token: "t", user }],
  [userSchema, user],
  [tasksPageSchema, { data: [{ id: 9, name: "Ormar", status: 1, offers: [{ id: 30, status: 1 }] }], meta: NO_MORE }],
  [offersPageSchema, { data: [{ id: 30, task_id: 9, user_id: 7, status: 0, price: "2000", task: { id: 9, name: "Ormar" } }], meta: { next_cursor: "c2" } }],
  [inboxCountSchema, { count_questions: 0, count_offers: 1, count_messages: 2, count_notifications: 32 }],
  [notificationsPageSchema, { data: [{ id: 992, type: "new-message-received", status: 0 }], meta: NO_MORE }],
  [conversationsPageSchema, { data: [{ id: 1 }], meta: NO_MORE }]
]

beforeEach(() => jest.clearAllMocks())

describe("API response shapes", () => {
  it.each(ANSWERS.map((a, i) => [i, ...a]))("answer %i matches its schema", (i, schema, answer) => {
    expect(schema.safeParse(answer).success).toBe(true)
  })

  it("a matching answer passes through untouched and quietly", () => {
    const answer = ANSWERS[2][1]
    expect(checkData(tasksPageSchema, "tasks")(answer)).toBe(answer)
    expect(reportError).not.toHaveBeenCalled()
  })

  it("a changed answer is reported, and still used as it came", () => {
    const changed = { data: [{ id: "9", name: "Ormar", status: 1 }], meta: NO_MORE }
    expect(checkData(tasksPageSchema, "tasks")(changed)).toBe(changed)
    expect(reportError).toHaveBeenCalledWith(expect.stringContaining("data.0.id"), "API shape tasks")
  })

  it("a user in an unknown role is caught", () => {
    expect(loginSchema.safeParse({ access_token: "t", user: { ...user, type: "ADMIN" } }).success).toBe(false)
  })
})
