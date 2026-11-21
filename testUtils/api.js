// api.js
// For screen tests: the API modules mocked (jest.mock("../Services/TasksAPI") etc. in the test file), each
// call answering like a server with nothing in it (API v2: the data of the answer).
// A test that needs data sets that one call's answer (TasksAPI.getTasks.mockResolvedValue(...)).
import * as TasksAPI from "../Services/TasksAPI"
import * as NotificationsAPI from "../Services/NotificationsAPI"
import * as UsersAPI from "../Services/UsersAPI"
import * as PaymentsAPI from "../Services/PaymentsAPI"
import * as API from "../Services/API"

// an empty v2 list page
const EMPTY_PAGE = { data: [], meta: { next_cursor: null } }

// what an empty server answers, per call (a list its empty page, a whole list []); anything else answers nothing
// (a v2 change: 204)
export const EMPTY_ANSWERS = {
  getTasks: EMPTY_PAGE,
  getTasksTasker: EMPTY_PAGE,
  getAllTaskQuestions: EMPTY_PAGE,
  getTaskOffers: EMPTY_PAGE,
  getTaskQuestions: [],
  getReviews: EMPTY_PAGE,
  getConversations: EMPTY_PAGE,
  getNotifications: EMPTY_PAGE,
  getCalendar: [],
  getMessages: EMPTY_PAGE,
  countNotifications: { count_questions: 0, count_offers: 0, count_messages: 0, count_notifications: 0 }
}

// a v2 list page of these items (nextCursor: the page after it)
export const pageOf = (items, nextCursor = null) => ({ data: items, meta: { next_cursor: nextCursor } })

// what a v2 call rejects with when the API refuses: an axios error carrying { error: { code, message, fields } }
export const refused = (status, code, message = "", fields) => ({ response: { status, data: { error: { code, message, ...(fields ? { fields } : {}) } } } })

// every mocked call of the API modules answers as an empty server (call it in beforeEach)
export const answerEmpty = () => {
  for (const module of [TasksAPI, NotificationsAPI, UsersAPI, PaymentsAPI, API]) {
    for (const [name, call] of Object.entries(module)) {
      if (jest.isMockFunction(call)) call.mockResolvedValue(EMPTY_ANSWERS[name])
    }
  }
}

export { TasksAPI, NotificationsAPI, UsersAPI, PaymentsAPI, API }
