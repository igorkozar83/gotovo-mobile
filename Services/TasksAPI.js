// TasksAPI.js
// Tasks, offers, questions, reviews and task dates (API v2: a list resolves to its page { data, meta: { next_cursor } },
// any other call to the answer's data, or nothing; a refusal rejects with the API's error, see Helpers/apiError).
import { api, upload } from "./client"
import { checkData, tasksPageSchema, offersPageSchema } from "./schemas"

const checkTasks = checkData(tasksPageSchema, "task list")
const checkOffers = checkData(offersPageSchema, "offers")

// "files" entries are { type: "image" | "video", uri }
const appendFiles = (formData, files) => {
  Object.values(files || {}).forEach((file) => {
    if (file.type === "image" || file.type === "video")
      formData.append("files[]", { uri: file.uri, name: file.uri.split("/").pop(), type: file.type + "/" + file.uri.split(".").pop() })
  })
}

const appendData = (formData, data) => {
  for (const key in data) formData.append(key, data[key])
}

// the upload's progress in % for uploadProgress(percent), when the caller wants it
const percent = (uploadProgress) => (status) => {
  if (uploadProgress && status && status.total) uploadProgress(Math.round((status.loaded * 100) / status.total))
}

const flag = (value) => (value === true || value === "true" ? 1 : 0)

const page = async (request) => (await request).data
const data = async (request) => (await request).data.data
const done = async (request) => {
  await request
}

//tasks
// the posted task
export const createTask = (fields, files, uploadProgress) => {
  const formData = new FormData()
  appendFiles(formData, files)
  appendData(formData, fields)
  return data(upload("tasks", formData, percent(uploadProgress)))
}

// the client's own tasks
export const getTasks = async (cursor, finished = false) => checkTasks(await page(api.get("tasks", { params: { cursor, finished: flag(finished) } })))

// a tasker's: the open tasks of others, or (mine) the ones assigned to them; filter: { sort_date, sort_type, category_id, filter_job }
export const getTasksTasker = async (cursor, finished = false, mine = false, filter = null) =>
  checkTasks(await page(api.get("tasks/feed", { params: { cursor, finished: flag(finished), mine: flag(mine), filter } })))

// a question about the task, or (questionId) the client's answer to one
export const createTaskQuestion = (fields, taskId, image, uploadProgress, questionId = null) => {
  const formData = new FormData()
  if (image) formData.append("image", { uri: image.uri, name: image.uri.split("/").pop(), type: "image/" + image.uri.split(".").pop() })
  appendData(formData, fields)
  if (questionId) formData.append("question_id", questionId)
  return data(upload("tasks/" + taskId + "/questions", formData, percent(uploadProgress)))
}

// all of a task's questions
export const getTaskQuestions = (taskId) => data(api.get("tasks/" + taskId + "/questions"))

// the tasks with questions (the inbox)
export const getAllTaskQuestions = (cursor) => page(api.get("questions", { params: { cursor } }))

export const getTaskOffer = (offerId) => data(api.get("offers/" + offerId))

// filter: { task_id }; sort: { sort, sort_price, type }
export const getTaskOffers = async (cursor, filter, sort = null) => checkOffers(await page(api.get("offers", { params: { cursor, filter, sort } })))

export const clientReadQuestion = (questionId) => done(api.post("questions/" + questionId + "/read"))

export const readTasksQuestionsTasker = () => done(api.post("questions/read"))

// the new offer
export const createTaskOffer = (taskId, fields) => data(api.post("tasks/" + taskId + "/offers", fields))

// the assigned tasker asks a new price: the task
export const editTaskOffer = (taskId, fields) => data(api.post("tasks/" + taskId + "/offers/revision", fields))

// the tasker withdraws an offer not accepted yet
export const cancelOffer = (offerId) => done(api.post("offers/" + offerId + "/withdraw"))

export const cancelTask = (taskId) => done(api.post("tasks/" + taskId + "/cancel"))

//reviews
export const createReview = (fields, files, uploadProgress) => {
  const formData = new FormData()
  appendFiles(formData, files)
  appendData(formData, fields)
  return data(upload("reviews", formData, percent(uploadProgress)))
}

export const submitReviewReply = ({ task_id, message }) => data(api.post("tasks/" + task_id + "/review-reply", { message }))

// sort: "Oldest" | "Worst rating" | "Best rating" (newest otherwise); someone else's: userId and userType together
export const getReviews = (cursor, sort, userId, userType) => page(api.get("reviews", { params: { cursor, sort, user_id: userId, user_type: userType } }))

//task dates and progress
export const acceptTaskDate = (timeId) => done(api.post("times/" + timeId + "/accept"))

export const completeTask = (taskId) => done(api.post("tasks/" + taskId + "/complete"))

// a new time proposed for the offer's task (date: [start, end]): the time
export const newTaskDateTasker = (offerId, date) => data(api.post("offers/" + offerId + "/times", { date }))

export const disputeTask = (fields, files, uploadProgress) => {
  const formData = new FormData()
  appendFiles(formData, files)
  appendData(formData, fields)
  return done(upload("tasks/" + fields.taskId + "/dispute", formData, percent(uploadProgress)))
}

// a proposed time accepted (1) or declined (3)
export const actionTaskTime = (timeId, status) => done(api.post("times/" + timeId + (status === 1 ? "/accept-proposal" : "/decline-proposal")))

// the client answers a price revision (the edited offer)
export const acceptRevision = (revisionId) => done(api.post("offers/" + revisionId + "/accept-revision"))

export const refuseRevision = (revisionId) => done(api.post("offers/" + revisionId + "/refuse-revision"))

export const getTaskById = (taskId) => data(api.get("tasks/" + taskId))

// the task of a time, with its offer
export const getTaskInfoByTimeId = (timeId) => data(api.get("times/" + timeId + "/task"))

// the tasker gives up an accepted offer
export const cancelTaskTasker = (offerId, reason) => done(api.post("offers/" + offerId + "/cancel", { reason }))

// type: "TASKER" (starts) or "CLIENT" (confirms the start)
export const startTask = (type, offerId) => done(api.post("offers/" + offerId + "/start", { type }))

export const confirmCompleteTask = (taskId) => done(api.post("tasks/" + taskId + "/confirm-complete"))

export const taskNotStarted = (offerId) => done(api.post("offers/" + offerId + "/not-started"))

// { accepted_time }: the task's only time, scheduled (null when it had several)
export const acceptTaskOffer = (offerId) => data(api.post("offers/" + offerId + "/accept"))
