import { jobRow, currentTaskRow, finishedTaskRow, offerRow, offerParty } from "../listRows"

const client = { id: 1, name: "Ana", last_name: "Petrovic", full_name: "Ana Petrovic", tasks_count: 7, avatar: "a.jpg", reviews: { total: 0 } }
const tasker = { id: 6, name: "Marko", last_name: "Jovic", full_name: "Marko Jovic", tasks_count: 3, reviews: { total: 0 } }

describe("jobRow", () => {
  it("shows the client short, the task and marks S.O.S.", () => {
    const row = jobRow({ name: "Fix sink", is_sos: 1, created: "2026-09-25 14:20:00", posted_by_user: client }, "EN")
    expect(row).toMatchObject({ sos: true, clientName: "Ana P.", title: "S.O.S. task: Fix sink", taskCount: 7, avatar: "a.jpg", date: "25 September 14:20" })
  })

  it("shows the client's small avatar when there is one", () => {
    expect(jobRow({ name: "X", created: "2026-09-25 14:20:00", posted_by_user: { ...client, avatar_thumbnail: "thumbs/a.jpg" } }, "EN").avatar).toBe("thumbs/a.jpg")
  })

  it("has no avatar when the client has none", () => {
    expect(jobRow({ name: "X", created: "2026-09-25 14:20:00", posted_by_user: { ...client, avatar: null } }, "EN").avatar).toBe("")
  })
})

describe("currentTaskRow", () => {
  const task = {
    name: "Paint",
    created: "2026-09-25 14:20:00",
    status: 0,
    offers: [
      { id: 1, status: 0 },
      { id: 2, status: 0 }
    ],
    times: []
  }

  it("a client sees the offers received; a tasker the task's progress for them", () => {
    expect(currentTaskRow(task, { userSelect: "CLIENT", language: "EN" })).toEqual({ date: "25 September 14:20", title: "Paint", status: "received", offers: 2, completion: false })
    expect(currentTaskRow({ ...task, offers: undefined }, { userSelect: "TASKER", language: "EN" }).offers).toBe(0)
  })
})

describe("finishedTaskRow", () => {
  const task = (fields) => ({ name: "Paint", accepted_by_user: tasker, posted_by_user: client, offers: [], times: [], ...fields })

  it("a client sees the tasker; a tasker sees the client", () => {
    expect(finishedTaskRow(task({ status: 2 }), { userSelect: "CLIENT", meId: 1, language: "EN" }).party).toBe("Marko Jovic")
    expect(finishedTaskRow(task({ status: 2 }), { userSelect: "TASKER", meId: 6, language: "EN" }).party).toBe("Ana Petrovic")
  })

  it("a canceled task shows when it was canceled", () => {
    const row = finishedTaskRow(task({ status: 4, updated: "2026-09-24 14:52:00" }), { userSelect: "CLIENT", meId: 1, language: "EN" })
    expect(row.date).toBe("24. September 14:52")
    expect(row.completed).toBe(false)
  })

  it("a finished task shows when it was completed", () => {
    const row = finishedTaskRow(task({ status: 2, offers: [{ status: 2, updated_at: "2026-09-25 09:15:00" }] }), { userSelect: "CLIENT", meId: 1, language: "EN" })
    expect(row.date).toBe("25. September 09:15")
    expect(row.completed).toBe(true)
  })
})

describe("offerRow", () => {
  const offer = (fields) => ({
    status: 1,
    price: "2000.00",
    created_at: "2026-09-24 16:06:00",
    user: tasker,
    task: { name: "Paint", is_sos: 0, posted_by_user: client },
    ...fields
  })

  it("a client sees the tasker, a tasker the client", () => {
    expect(offerParty(offer(), "CLIENT")).toBe(tasker)
    expect(offerParty(offer(), "TASKER")).toBe(client)
  })

  it("a new offer shows the short name, others the full one", () => {
    expect(offerRow(offer({ status: 0 }), { userSelect: "CLIENT", language: "EN" }).partyName).toBe("Marko J.")
    expect(offerRow(offer(), { userSelect: "CLIENT", language: "EN" }).partyName).toBe("Marko Jovic")
  })

  it("marks an S.O.S. task and reads the price", () => {
    const row = offerRow(offer({ task: { name: "Leak", is_sos: 1, posted_by_user: client } }), { userSelect: "CLIENT", language: "EN" })
    expect(row.title).toBe("SOS task: Leak")
    expect(row.price).toBe(2000)
    expect(row.date).toBe("24 September 16:06")
  })
})
