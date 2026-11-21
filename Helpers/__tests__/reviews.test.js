import { reviewStars, starCount, starShare, reviewerName } from "../reviews"

describe("reviews", () => {
  it("reviewStars reads the flag that is set", () => {
    expect(reviewStars({ four_star: 1 })).toBe(4)
    expect(reviewStars({ one_star: 1 })).toBe(1)
    expect(reviewStars({})).toBeUndefined()
  })

  it("starShare is the rounded share of the total", () => {
    const summary = { total: 3, five_star: 2, four_star: 1 }
    expect(starCount(summary, 5)).toBe(2)
    expect(starShare(summary, 5)).toBe("67")
    expect(starShare(summary, 1)).toBe(0)
    expect(starShare(undefined, 5)).toBe(0)
  })

  it("reviewerName shortens the last name", () => {
    expect(reviewerName({ full_name: "Ana Maria_Petrovic" })).toBe("Ana Petrovic.")
    expect(reviewerName({ full_name: "Mistera h" })).toBe("Mistera")
  })
})
