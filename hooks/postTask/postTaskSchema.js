// postTaskSchema.js
// What a task needs before it is posted (a logged-in user) or before a guest registers and posts it.
// The messages are translation keys; the form shows the first four, in the order below.
import { z } from "zod"

import { EMAIL } from "../../Helpers/validation"

// the task itself (both cases)
const subTask = z.looseObject({ id: z.number("Subcategory is not selected.") }, "Subcategory is not selected.")
const taskName = z.string().min(1, "Please enter task name.")
const taskDesc = z.string().min(1, "Please enter task description.")
const dates = z.array(z.array(z.string())).min(1, "Please enter at least one prefered time.")

export const postTaskSchema = z.looseObject({
  subTask,
  taskName,
  taskDesc,
  dates,
  agreement: z.literal(true, "You need to agree our terms & conditions in order to post a task."),
  phone: z.string().min(1, "Please enter your contact phone number."),
  address: z.looseObject({ id: z.number("Please select address for this task.") })
})

// a guest registers first (the task is posted once they are logged in)
export const guestPostTaskSchema = z
  .looseObject({
    guest: z.object({
      email: z.string().regex(EMAIL, "Please enter valid email."),
      password: z.string().min(8, "Minimum password length is 8."),
      confirmPassword: z.string(),
      name: z.string().min(1, "Please enter name"),
      lastName: z.string().min(1, "Please enter last name")
    }),
    agreement: z.literal(true, "You must accept our terms & conditions in order to register account."),
    subTask,
    taskName,
    taskDesc,
    dates
  })
  .refine((values) => values.guest.password === values.guest.confirmPassword, {
    message: "Password and confirm password do not match.",
    path: ["guest", "confirmPassword"]
  })

// the fields in the order their messages are listed
export const POST_TASK_FIELDS = ["subTask", "taskName", "taskDesc", "dates", "agreement", "phone", "address"]
export const GUEST_FIELDS = ["guest.email", "agreement", "guest.password", "guest.confirmPassword", "guest.name", "guest.lastName", "subTask", "taskName", "taskDesc", "dates"]
