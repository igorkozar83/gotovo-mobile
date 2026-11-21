// fixtures.js
// The objects the API sends, as small as the components need them: the two parties, a task with its
// offers and times, an offer. Each builder takes the fields a test changes.
// Task status: 0 open, 1 accepted, 2 finished, 3 waiting for completion, 4 canceled, 8 / 9 started.
// Offer status: 0 sent, 1 accepted, 2 finished, 4 canceled, 5 disputed (edit_id: a revision of offer edit_id).

export const client = { id: 6, name: "Ana", last_name: "Anic", full_name: "Ana Anic", avatar: null, tasks_count: 4, tasks_count_client: 4, reviews: { total: 0 } }
export const tasker = { id: 7, name: "Pera", last_name: "Peric", full_name: "Pera Peric", avatar: null, tasks_count: 12, tasks_count_tasker: 12, reviews: { total: 0 } }

export const timeOf = (fields = {}) => ({ id: 1, date: "2099-10-05", start: "10:00:00", end: "12:00:00", status: 0, ...fields })

export const offerOf = (fields = {}) => ({
  id: 30,
  status: 0,
  price: "2500.00",
  explanation: "Two hours",
  edit_id: null,
  user_id: tasker.id,
  user: tasker,
  created_at: "2026-10-01 09:00:00",
  updated_at: "2026-10-01 09:00:00",
  ...fields
})

export const taskOf = (fields = {}) => ({
  id: 9,
  name: "Fix the tap",
  description: "The kitchen tap drips",
  status: 0,
  is_sos: false,
  created: "2026-09-30 08:00:00",
  updated: "2026-10-01 08:00:00",
  posted_by_user: client,
  accepted_by_user: null,
  offers: [],
  times: [timeOf()],
  reviews: [],
  images: [],
  questions: [],
  ...fields
})

// an accepted task, scheduled at its first time
export const acceptedTask = (fields = {}) => taskOf({ status: 1, accepted_by_user: tasker, offers: [offerOf({ status: 1 })], times: [timeOf({ status: 1 })], ...fields })

// a finished task (its offer finished)
export const finishedTask = (fields = {}) =>
  taskOf({ status: 2, accepted_by_user: tasker, offers: [offerOf({ status: 2, updated_at: "2026-10-05 12:00:00" })], times: [timeOf({ status: 1 })], ...fields })
