import { calcStars, shortenString, shortenName, fName, lName, localPriceFixed, amount, isImage, handleError, allReplace } from "../index"

describe("calcStars", () => {
  const reviewed = { id: 1, reviews: { total: 4, five_star: 2, four_star: 1, three_star: 1, two_star: 0, one_star: 0 } }

  it("averages the reviews", () => {
    expect(calcStars(reviewed)).toBe("4")
    expect(calcStars(reviewed, 1)).toBe("4.3")
  })

  it("is 0 without reviews or user", () => {
    expect(calcStars(null)).toBe(0)
    expect(calcStars({ id: 1, reviews: { total: 0 } })).toBe(0)
  })
})

describe("names", () => {
  it("shortenString cuts long text", () => {
    expect(shortenString("abcdef", 3)).toBe("abc...")
    expect(shortenString("abc", 3)).toBe("abc")
    expect(shortenString(null)).toBe("")
  })

  it("full names are 'First_Last'", () => {
    expect(shortenName("Ana_Petrovic")).toBe("Ana Petrovic.")
    expect(fName("Ana Maria")).toBe("Ana")
    expect(lName("Ana_Petrovic")).toBe("Petrovic")
    expect(lName("Ana_Petrovic", true)).toBe("P")
  })
})

describe("prices", () => {
  it("group thousands with dots and drop the decimals", () => {
    expect(localPriceFixed(2000)).toBe("2.000")
  })

  it("an amount from a number or the server's text, and one already shown stays", () => {
    expect(amount(12500)).toBe("12.500")
    expect(amount("12500.00")).toBe("12.500")
    expect(amount("850")).toBe("850")
    expect(amount("12.500")).toBe("12.500")
    expect(amount("")).toBe("")
    expect(amount(null)).toBe(null)
  })
})

describe("isImage", () => {
  it("tells images from other files by extension", () => {
    expect(isImage("https://x/a.JPG")).toBe(true)
    expect(isImage("https://x/a.mp4")).toBe(false)
    expect(isImage(null)).toBeNull()
  })
})

describe("handleError", () => {
  const v2 = (status, code, message, fields) => ({ response: { status, data: { error: { code, message, fields } } } })

  it("by the error's code: a disabled account (type 0), not found (type 2), the rest (type 1)", () => {
    expect(handleError(v2(401, "account_disabled", "Disabled"))).toEqual({ message: "Disabled", type: 0 })
    // a token that stopped working is not a disabled account
    expect(handleError(v2(401, "unauthenticated", "Unauthorized."))).toEqual({ message: "Unauthorized.", type: 1 })
    expect(handleError(v2(404, "not_found", "Task not found."))).toEqual({ message: "Task not found.", type: 2 })
    expect(handleError(v2(422, "refused", "Too late"))).toEqual({ message: "Too late", type: 1 })
  })

  it("invalid fields are listed (type 1), with a special text for too big files", () => {
    expect(handleError(v2(422, "invalid", "The given data was invalid.", { name: ["required"], "files.0": ["validation.max.file"] })).message).toBe(
      "Please enter name.\nYour file size exceeded max upload file size of 50MB. Please reduce file size and try again."
    )
  })

  it("a request without an API answer has no message", () => {
    expect(handleError(new Error("Network Error"))).toEqual({ message: "", type: 1 })
    expect(handleError({ response: { status: 502, data: "<html>Bad gateway</html>" } })).toEqual({ message: "", type: 1 })
  })
})

describe("misc", () => {
  it("allReplace replaces every key", () => {
    expect(allReplace("a-b-a", { a: "x", b: "y" })).toBe("x-y-x")
  })
})

describe("dates", () => {
  const { timeFormat, dateDotTime, timeFormatNoTime, day, monthThree, hourMin, dateMonth, getDate } = require("../index")
  const at = "2026-10-08 10:05:00"

  it("formats in the app's language", () => {
    expect(timeFormat(at, "EN")).toBe("8 October 10:05")
    expect(dateDotTime(at, "EN")).toBe("8. October 10:05")
    expect(timeFormatNoTime(at, "EN")).toBe("8. October 2026.")
    expect(day(at, "EN")).toBe("8")
    expect(monthThree(at, "EN")).toBe("Oct")
    expect(hourMin(at)).toBe("10:05")
    expect(dateMonth(at, "EN")).toBe("8th Oct")
    expect(dateMonth(null, "EN")).toBe("")
    expect(getDate(at)).toBe("2026-10-08")
  })

  it("a date's day has come by the calendar: not the day before, however few hours are left", () => {
    const { isDayReached } = require("../index")
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 17, 11, 42))
    try {
      expect(isDayReached("2026-11-18")).toBe(false)
      expect(isDayReached("2026-11-17")).toBe(true)
      expect(isDayReached("2026-11-16")).toBe(true)
      expect(isDayReached(null)).toBe(false)
    } finally {
      jest.useRealTimers()
    }
  })
})
