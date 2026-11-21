import { feeFor } from "../payments"

describe("feeFor", () => {
  const fees = ["300", "100", "200"]

  it("picks the smallest fee up to 2000, the middle up to 4000, the largest above", () => {
    expect(feeFor(1500, fees)).toBe(100)
    expect(feeFor(2000, fees)).toBe(100)
    expect(feeFor(2001, fees)).toBe(200)
    expect(feeFor(4000, fees)).toBe(200)
    expect(feeFor(9000, fees)).toBe(300)
  })

  it("is null while the fees are not known", () => {
    expect(feeFor(1000, null)).toBeNull()
    expect(feeFor(1000, [])).toBeNull()
  })
})
