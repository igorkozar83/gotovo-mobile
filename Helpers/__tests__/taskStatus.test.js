import {
  offerStatus,
  offerStatusTasker,
  getAcceptedOffer,
  getTaskerOffer,
  getOtherUser,
  getUserReview,
  isScheduled,
  getPendingRevision,
  getDisputedOffer,
  getClientTaskOffer,
  getClientTaskPrice,
  startedTaskRequest,
  newTimeRequest,
  acceptedTimeOf,
  timeRangeOf
} from "../taskStatus"

const task = (fields) => ({ status: 0, offers: [], times: [], ...fields })

describe("offerStatus (client)", () => {
  it.each([
    ["an open task without offers", task({}), "wait"],
    ["an open task with offers", task({ offers: [{ status: 0 }] }), "received"],
    ["an accepted task", task({ status: 1, offers: [{ status: 1 }] }), "accepted"],
    ["an accepted task with a time", task({ status: 1, offers: [{ status: 1 }], times: [{ status: 1 }] }), "scheduled"],
    ["a finished task", task({ status: 2, offers: [{ status: 2 }] }), "finished"],
    ["a task to confirm", task({ status: 3 }), "completion"],
    ["a canceled task", task({ status: 4 }), "canceled"],
    ["a task the tasker started", task({ status: 8 }), "startedByTasker"],
    ["a task the client started", task({ status: 9 }), "startedByClient"],
    ["a revised offer", task({ status: 1, offers: [{ status: 1 }, { status: 0, edit_id: 7 }] }), "revised"],
    ["a disputed offer", task({ status: 1, offers: [{ status: 5 }] }), "disputed"]
  ])("%s is %s", (_, t, status) => {
    expect(offerStatus(t)).toBe(status)
  })

  it("a finished task's revision doesn't count", () => {
    expect(offerStatus(task({ status: 2, offers: [{ status: 2, edit_id: 7 }] }))).toBe("finished")
  })
})

describe("offerStatusTasker", () => {
  it("a finished task is finished before any revision", () => {
    expect(offerStatusTasker(task({ status: 2, offers: [{ status: 0, edit_id: 7 }] }))).toBe("finished")
  })

  it("an accepted task with a time is scheduled", () => {
    expect(offerStatusTasker(task({ status: 1, offers: [{ status: 1 }], times: [{ status: 1, date: "2999-01-01", start: "10:00:00" }] }))).toBe("scheduled")
  })
})

describe("offers", () => {
  const offers = [
    { id: 1, status: 0 },
    { id: 2, status: 1 },
    { id: 3, status: 5 }
  ]

  it("the accepted offer is the last accepted one, else an empty offer", () => {
    expect(getAcceptedOffer(task({ offers })).id).toBe(2)
    expect(getAcceptedOffer(task({}))).toEqual({ user: {} })
  })

  it("the tasker's offer includes a disputed one", () => {
    expect(getTaskerOffer(task({ offers })).id).toBe(3)
  })
})

describe("getOtherUser", () => {
  const client = { id: 1 }
  const tasker = { id: 2 }

  it("is the client for a tasker", () => {
    expect(getOtherUser(task({ posted_by_user: client }), "TASKER")).toBe(client)
  })

  it("is the accepted tasker for a client, once an offer was accepted", () => {
    expect(getOtherUser(task({ accepted_by_user: tasker, offers: [{ status: 1 }] }), "CLIENT")).toBe(tasker)
    expect(getOtherUser(task({ accepted_by_user: tasker, offers: [{ status: 0 }] }), "CLIENT")).toEqual({ user: {} })
  })
})

describe("times", () => {
  it("the scheduled time is the last accepted one", () => {
    const t = task({
      times: [
        { status: 0, date: "2026-10-01", start: "08:00:00" },
        { status: 1, date: "2026-10-02", start: "10:00:00" }
      ]
    })
    expect(isScheduled(t)).toBe(true)
  })
})

describe("getUserReview", () => {
  it("is the user's last review, else null", () => {
    const reviews = [
      { id: 1, user_id: 5 },
      { id: 2, user_id: 6 }
    ]
    expect(getUserReview(task({ reviews }), 6).id).toBe(2)
    expect(getUserReview(task({ reviews }), 7)).toBeNull()
    expect(getUserReview(task({}), 6)).toBeNull()
  })
})

describe("client task offer", () => {
  const accepted = { id: 1, status: 1, price: "2000" }

  it("is the accepted offer, or the disputed one while disputed", () => {
    const t = task({ offers: [accepted, { id: 2, status: 5 }] })
    expect(getClientTaskOffer(t, "accepted")).toBe(accepted)
    expect(getClientTaskOffer(t, "disputed").id).toBe(2)
    expect(getDisputedOffer(task({}))).toEqual({ user: {} })
  })

  it("shows an accepted revision's price over the offer's", () => {
    expect(getClientTaskPrice(task({ offers: [accepted] }), "accepted")).toBe("2000")
    expect(getClientTaskPrice(task({ offers: [accepted, { id: 3, edit_id: 1, status: 3, price: "2500" }] }), "accepted")).toBe("2500")
  })

  it("finds the revision waiting for an answer", () => {
    expect(getPendingRevision(task({ offers: [accepted, { id: 4, edit_id: 1, status: 0 }] })).id).toBe(4)
    expect(getPendingRevision(task({ offers: [accepted] }))).toBeUndefined()
  })
})

describe("startedTaskRequest", () => {
  it("describes the started task for the modal", () => {
    const user = (id) => ({ id, avatar: "a", full_name: "N" + id })
    const t = task({ id: 9, name: "T", status: 8, offers: [{ id: 1, status: 8 }], times: [{ id: 5, status: 1 }], posted_by_user: user(6), accepted_by_user: user(1) })
    expect(startedTaskRequest(t)).toEqual({
      type: "tasker-start-task",
      taskId: 9,
      taskOffer: { id: 1, status: 8 },
      taskName: "T",
      acceptedTime: { id: 5, status: 1 },
      postedBy: { id: 6, avatar: "a", name: "N6" },
      acceptedByUser: { id: 1, avatar: "a", name: "N1" }
    })
  })
})

describe("newTimeRequest", () => {
  it("describes the proposed time for the modal, or is null without one", () => {
    const proposed = { id: 3, date: "2026-10-01", start: "10:00:00", end: "12:00:00", user_id: 1 }
    const t = task({ id: 9, name: "T", proposed_time: [proposed] })
    expect(newTimeRequest(t, { id: 1, full_name: "A B", avatar: "a" })).toEqual({
      acceptedBy: { id: 1, fullName: "A B", avatar: "a" },
      taskId: 9,
      taskName: "T",
      type: "new-task-time",
      date: ["2026-10-01 10:00:00", "2026-10-01 12:00:00"],
      timeId: proposed
    })
    expect(newTimeRequest(task({}), {})).toBeNull()
  })
})

describe("acceptedTimeOf", () => {
  it("takes the accepted time from a list, or the time itself", () => {
    expect(
      acceptedTimeOf([
        { id: 1, status: 0 },
        { id: 2, status: 1 }
      ]).id
    ).toBe(2)
    expect(acceptedTimeOf([{ id: 1, status: 0 }]).id).toBe(1)
    expect(acceptedTimeOf({ id: 3 }).id).toBe(3)
    expect(acceptedTimeOf(undefined)).toBeNull()
    expect(acceptedTimeOf([])).toBeNull()
  })
})

describe("timeRangeOf", () => {
  it("joins a date with clock times, keeps datetimes, gives up without a date", () => {
    expect(timeRangeOf({ date: "2026-10-01", start: "10:00:00", end: "12:00:00" })).toEqual({ from: "2026-10-01 10:00:00", to: "2026-10-01 12:00:00" })
    expect(timeRangeOf({ start: "2026-10-01 10:00:00", end: "2026-10-01 12:00:00" })).toEqual({ from: "2026-10-01 10:00:00", to: "2026-10-01 12:00:00" })
    expect(timeRangeOf({ start: "10:00:00", end: "12:00:00" })).toBeNull()
    expect(timeRangeOf(null)).toBeNull()
  })
})
