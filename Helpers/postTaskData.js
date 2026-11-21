// postTaskData.js
// The post-a-task form's data, without React: its empty values, the jobs of a category, an option's
// starting value, the task as the API takes it, a reposted task as form values, and the form's errors
// as the user reads them.
import { translate } from "./language.utils"

export const MAX_LISTED_ERRORS = 4

// an option's starting value: a number option 10, a yes/no option no (the user ticks it: "materials needed" was
// ticked for everyone)
export const defaultOptions = (job) => (job?.options || []).map((option) => ({ id: option.id, value: option.type === 1 ? 10 : 0 }))

// the jobs of a category (0 = all categories)
export const jobsOf = (services, category) => (services || []).filter((service) => !category || service.categoryId === category).flatMap((service) => service.tasks)

export const emptyValues = () => ({
  subTask: {},
  options: [],
  taskName: "",
  taskDesc: "",
  additionalInstruction: "",
  dates: [],
  flexibleDates: true,
  isSos: false,
  address: { id: null, place_name: translate("postTaskData.selectTaskAddress") },
  newAddress: null,
  useSavedPhone: false,
  phone: "",
  agreement: false,
  guest: { name: "", lastName: "", email: "", password: "", confirmPassword: "" }
})

// what a posted task's form keeps for the next one
export const clearedValues = (values) => ({
  ...values,
  taskName: "",
  taskDesc: "",
  phone: "",
  additionalInstruction: "",
  flexibleDates: false,
  newAddress: null,
  dates: [],
  useSavedPhone: false
})

// the task as the API takes it; savedPhone: the user's verified phone; keptImages: a repost's old photos
export const taskPayload = (values, { savedPhone, keptImages }) => ({
  sub_category_task_id: values.subTask.id,
  name: values.taskName,
  description: values.taskDesc,
  flexible_dates: values.flexibleDates ? 1 : 0,
  place: values.address.id,
  contact: values.useSavedPhone ? savedPhone : values.phone,
  additional_instructions: values.additionalInstruction,
  is_sos: values.isSos,
  times: JSON.stringify(values.dates.map(([startTime, endTime]) => ({ startTime, endTime }))),
  options: JSON.stringify(values.options),
  images_from_task: JSON.stringify(keptImages)
})

/**
 * An old task as the new form's values ("post this task again"): only its times still ahead of `now`,
 * its option answers over the job's defaults, and its job and category when the job still exists.
 * Returns { values, job, options, category, images }.
 */
export const repostValues = (task, { services, savedPhone, now = new Date() }) => {
  const upcoming = (task.times || []).filter((time) => new Date(time.date + "T" + time.start) > now)
  const values = {
    taskName: task.name,
    taskDesc: task.description,
    additionalInstruction: task.additional_instructions,
    flexibleDates: Boolean(task.flexible_dates),
    isSos: Boolean(task.is_sos),
    phone: task.contact && task.contact !== "null" ? task.contact + "" : savedPhone ? String(savedPhone) : "",
    dates: upcoming.map((time) => [time.date + " " + time.start.slice(0, -3), time.date + " " + time.end.slice(0, -3)])
  }
  if (task.address && task.address.id) values.address = task.address

  const category = task.sub_category_task?.subCategory?.category?.id
  const job = category !== undefined ? jobsOf(services, category).find((candidate) => candidate.id === task.sub_category_task_id) || null : null
  const options = job
    ? defaultOptions(job).map((option) => {
        const old = (task.options || []).find((taskOption) => taskOption.task_option_id === option.id)
        if (!old) return option
        return { ...option, value: old.task_option_info.type === 2 ? (old.task_option_value === "1" ? 1 : 0) : old.task_option_value }
      })
    : null
  return { values, job, options, category, images: (task.images || []).map((image) => image.url) }
}

// the first message of a field's error (react-hook-form nests them like the values)
const messageOf = (error) => {
  if (!error) return null
  if (error.message) return error.message
  const nested = Object.values(error).find((value) => value && typeof value === "object")
  return messageOf(nested)
}
const errorAt = (errors, path) => path.split(".").reduce((node, key) => node && node[key], errors)

// the first few problems, in the form's order (fields: the form's field paths in that order)
export const formProblems = (errors, fields) =>
  fields
    .map((path) => messageOf(errorAt(errors, path)))
    .filter(Boolean)
    .slice(0, MAX_LISTED_ERRORS)
    .map((message) => translate(message))
    .join("\n")
