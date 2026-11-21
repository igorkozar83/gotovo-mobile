import { notificationText, notificationTexts } from "../notifications"

jest.mock("../language.utils", () => ({
  translate: (text) =>
    ({ "Offer for !!taskName!! accepted": "Ponuda za !!taskName!! prihvaćena", "New question: !!taskQuestion!!": "Novo pitanje: !!taskQuestion!!" })[text] || text
}))

describe("notificationText", () => {
  it("translates with the task name kept", () => {
    expect(notificationText({ body: "Offer for Kitchen accepted" }, { taskName: "Kitchen" })).toBe("Ponuda za Kitchen prihvaćena")
    expect(notificationText({ body: "Offer for Kitchen accepted" }, { task: { taskName: "Kitchen" } })).toBe("Ponuda za Kitchen prihvaćena")
    expect(notificationText({ body: "Offer for Kitchen accepted" }, { task: { task: { name: "Kitchen" } } })).toBe("Ponuda za Kitchen prihvaćena")
  })

  it("keeps a question and leaves unknown text as it is", () => {
    expect(notificationText({ body: "New question: Parking?" }, { taskQuestion: "Parking?" })).toBe("Novo pitanje: Parking?")
    expect(notificationText({ body: "Something new" }, {})).toBe("Something new")
  })
})

describe("notificationTexts", () => {
  const data = { type: "mass-notif", texts: { SR: { title: "Zdravo", body: "Telo" }, EN: { title: "Hello", body: "Body" } } }

  it("gives a notice from the admin in the app's language, else in English", () => {
    expect(notificationTexts(data, "SR")).toEqual({ title: "Zdravo", body: "Telo" })
    expect(notificationTexts(data, "EN")).toEqual({ title: "Hello", body: "Body" })
    expect(notificationTexts(data, "CZ")).toEqual({ title: "Hello", body: "Body" })
  })

  it("nothing for a notice without its languages (an older one, or any other kind)", () => {
    expect(notificationTexts({ type: "mass-notif" }, "SR")).toBeNull()
    expect(notificationTexts(null, "SR")).toBeNull()
  })
})
