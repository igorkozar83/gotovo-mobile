import { filterServices } from "../services"

jest.mock("../language.utils", () => ({ translate: (text) => text }))

const services = [
  { id: 1, categoryId: 2, featured: 1, blackText: "Kitchen", additionalText: "assembly" },
  { id: 2, categoryId: 2, featured: 0, blackText: "Selidba", additionalText: "stana" },
  { id: 3, categoryId: 3, featured: 0, blackText: "Čišćenje", additionalText: "kancelarije" }
]

describe("filterServices", () => {
  it("shows a category, or the featured ones for 0", () => {
    expect(filterServices(services, 2, "").map((s) => s.id)).toEqual([1, 2])
    expect(filterServices(services, 0, "").map((s) => s.id)).toEqual([1])
  })

  it("searches the category, also without diacritics", () => {
    expect(filterServices(services, 2, "kitch").map((s) => s.id)).toEqual([1])
    expect(filterServices(services, 3, "ciscenje").map((s) => s.id)).toEqual([3])
    expect(filterServices(services, 2, "ciscenje")).toEqual([])
  })
})
