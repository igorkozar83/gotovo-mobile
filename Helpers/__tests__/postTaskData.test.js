import { defaultOptions, jobsOf, clearedValues, taskPayload, repostValues, formProblems } from "../postTaskData"

const job = {
  id: 11,
  options: [
    { id: 1, type: 1 },
    { id: 2, type: 2 }
  ]
}
const services = [
  { categoryId: 3, tasks: [job] },
  { categoryId: 4, tasks: [{ id: 12, options: [] }] }
]

describe("jobs and options", () => {
  it("lists the jobs of a category, or all with 0", () => {
    expect(jobsOf(services, 3)).toEqual([job])
    expect(jobsOf(services, 0).map((j) => j.id)).toEqual([11, 12])
    expect(jobsOf(null, 3)).toEqual([])
  })

  it("starts a number option at 10 and a yes/no option at no", () => {
    expect(defaultOptions(job)).toEqual([
      { id: 1, value: 10 },
      { id: 2, value: 0 }
    ])
  })
})

describe("taskPayload", () => {
  const values = {
    subTask: { id: 11 },
    taskName: "Paint",
    taskDesc: "Two rooms",
    flexibleDates: true,
    address: { id: 5 },
    useSavedPhone: false,
    phone: "0601234567",
    additionalInstruction: "",
    isSos: false,
    dates: [["2026-10-08 10:00", "2026-10-08 12:00"]],
    options: [{ id: 1, value: 10 }]
  }

  it("builds what the API takes", () => {
    const payload = taskPayload(values, { savedPhone: 381649208024, keptImages: ["a.jpg"] })
    expect(payload).toMatchObject({ sub_category_task_id: 11, name: "Paint", flexible_dates: 1, place: 5, contact: "0601234567" })
    expect(JSON.parse(payload.times)).toEqual([{ startTime: "2026-10-08 10:00", endTime: "2026-10-08 12:00" }])
    expect(JSON.parse(payload.images_from_task)).toEqual(["a.jpg"])
  })

  it("sends the saved phone when chosen", () => {
    expect(taskPayload({ ...values, useSavedPhone: true }, { savedPhone: 381649208024, keptImages: [] }).contact).toBe(381649208024)
  })
})

describe("clearedValues", () => {
  it("keeps the job and place for the next task, clears the rest", () => {
    const cleared = clearedValues({ subTask: job, address: { id: 5 }, taskName: "Paint", dates: [["a", "b"]], useSavedPhone: true })
    expect(cleared).toMatchObject({ subTask: job, address: { id: 5 }, taskName: "", dates: [], useSavedPhone: false, flexibleDates: false })
  })
})

describe("repostValues", () => {
  const old = {
    name: "Paint",
    description: "Two rooms",
    additional_instructions: "Ring twice",
    flexible_dates: 1,
    is_sos: 0,
    contact: "null",
    address: { id: 5 },
    sub_category_task_id: 11,
    sub_category_task: { subCategory: { category: { id: 3 } } },
    times: [
      { date: "2026-01-01", start: "10:00:00", end: "12:00:00" },
      { date: "2026-12-01", start: "09:00:00", end: "11:00:00" }
    ],
    options: [{ task_option_id: 2, task_option_value: "0", task_option_info: { type: 2 } }],
    images: [{ url: "x.jpg" }]
  }

  it("keeps only the times still ahead and the saved phone when the old contact is empty", () => {
    const { values } = repostValues(old, { services, savedPhone: 381649208024, now: new Date("2026-09-27T12:00:00") })
    expect(values.dates).toEqual([["2026-12-01 09:00", "2026-12-01 11:00"]])
    expect(values.phone).toBe("381649208024")
    expect(values.address).toEqual({ id: 5 })
  })

  it("puts the old option answers over the job's defaults", () => {
    const repost = repostValues(old, { services, savedPhone: null, now: new Date("2026-09-27") })
    expect(repost.job).toBe(job)
    expect(repost.category).toBe(3)
    expect(repost.options).toEqual([
      { id: 1, value: 10 },
      { id: 2, value: 0 }
    ])
    expect(repost.images).toEqual(["x.jpg"])
  })

  it("has no job when the job no longer exists", () => {
    expect(repostValues({ ...old, sub_category_task_id: 99 }, { services, savedPhone: null }).job).toBeNull()
  })
})

describe("formProblems", () => {
  it("lists the first four problems in the form's order", () => {
    const errors = { taskName: { message: "Name" }, guest: { email: { message: "Email" } }, dates: { message: "Dates" }, a: { message: "A" }, b: { message: "B" } }
    expect(formProblems(errors, ["taskName", "guest.email", "dates", "a", "b"])).toBe("Name\nEmail\nDates\nA")
  })
})
