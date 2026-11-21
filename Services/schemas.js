// schemas.js
// The shape the app relies on in the API's main answers (only the fields it reads; others pass through).
// checkData compares an answer's data with its schema: a mismatch is reported (in development) and the data
// is used as it came, so a server change shows up early without breaking the app.
import { z } from "zod"

import { reportError } from "../Helpers/reportError"

const id = z.number()

export const userSchema = z.looseObject({
  id,
  type: z.enum(["CLIENT", "TASKER"]),
  channel: z.string(),
  name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
  addresses: z.array(z.looseObject({ id })).optional(),
  verifications: z.looseObject({}).nullable().optional()
})

// a successful login (email, Google, Facebook, Apple)
export const loginSchema = z.looseObject({ access_token: z.string(), user: userSchema })

// a v2 list page
const page = (item) => z.looseObject({ data: z.array(item), meta: z.looseObject({ next_cursor: z.string().nullable() }) })

const taskSchema = z.looseObject({ id, name: z.string(), status: z.number(), offers: z.array(z.looseObject({ id, status: z.number() })).optional() })

export const tasksPageSchema = page(taskSchema)

export const offersPageSchema = page(z.looseObject({ id, task_id: id, user_id: id, status: z.number(), task: z.looseObject({ id, name: z.string() }) }))

export const inboxCountSchema = z.looseObject({
  count_questions: z.number(),
  count_offers: z.number(),
  count_messages: z.number(),
  count_notifications: z.number()
})

export const notificationsPageSchema = page(z.looseObject({ id, type: z.string(), status: z.number() }))

export const conversationsPageSchema = page(z.looseObject({ id }))

// data, compared with schema; a mismatch is reported, never thrown
export const checkData = (schema, name) => (data) => {
  const result = schema.safeParse(data)
  if (!result.success) reportError(result.error.issues.map((issue) => issue.path.join(".") + ": " + issue.message).join("; "), "API shape " + name)
  return data
}
