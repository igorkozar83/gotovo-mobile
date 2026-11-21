import { clampPrice, offerStatusLabel, offerPriceKind, isFadedOffer } from "../offer"

describe("clampPrice", () => {
  it("keeps whole numbers up to 200000", () => {
    expect(clampPrice("1500")).toBe("1500")
    expect(clampPrice("15.7")).toBe("15")
    expect(clampPrice("250000")).toBe("200000")
  })

  it("empties anything that is not a number", () => {
    expect(clampPrice("")).toBe("")
    expect(clampPrice("abc")).toBe("")
  })
})

describe("offer status display", () => {
  it("labels a sent offer by who sees it", () => {
    expect(offerStatusLabel(0, true).text).toBe("NEW OFFER")
    expect(offerStatusLabel(0, false).text).toBe("OFFER SENT")
    expect(offerStatusLabel(8, true)).toEqual({ text: "ACCEPTED", color: "#002FAF" })
    expect(offerStatusLabel(7, true)).toBeNull()
  })

  it("picks the arrow and fades refused or canceled offers", () => {
    expect([0, 1, 4, 5, 6, 7].map(offerPriceKind)).toEqual(["offer", "finished", "refused", "refused", "refused", null])
    expect([4, 6, 5].map(isFadedOffer)).toEqual([true, true, false])
  })
})
