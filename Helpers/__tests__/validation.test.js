import { isValidEmail, failedRules, newPasswordProblems, personName } from "../validation"

describe("personName", () => {
  it("keeps letters of any alphabet with their accents, spaces, hyphens, apostrophes and dots", () => {
    for (const name of ["Ana-Marija", "Šćepan Đurić", "D'Arcy", "D’Arcy", "J. Petrović", "Иван", "Müller", "Øster", "Νίκος", "José"]) expect(personName(name)).toBe(name)
  })

  it("drops digits and other signs as they are typed", () => {
    expect(personName("Ana2")).toBe("Ana")
    expect(personName("Aca test 100")).toBe("Aca test ")
    expect(personName("#Pe@ra!_")).toBe("Pera")
    expect(personName(null)).toBe("")
  })
})

describe("isValidEmail", () => {
  it.each(["user@mail.com", "first.last+tag@sub.domain.rs", "a@b"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true)
  })

  it.each(["", "user", "user@", "@mail.com", "user mail@mail.com", "user@-mail.com"])("rejects %p", (email) => {
    expect(isValidEmail(email)).toBe(false)
  })
})

describe("failedRules", () => {
  it("lists the failed rules' messages in order, one per line", () => {
    expect(
      failedRules([
        [true, "First problem"],
        [false, "Not a problem"],
        [true, "Second problem"]
      ])
    ).toBe("First problem\nSecond problem")
  })

  it("is empty when every rule passes", () => {
    expect(failedRules([[false, "Fine"]])).toBe("")
  })
})

describe("newPasswordProblems", () => {
  it("asks for 8 characters and a matching repetition", () => {
    expect(newPasswordProblems("short", "other")).toBe("Minimum password length is 8.\nNew password and repeat new password must match.")
    expect(newPasswordProblems("longenough", "longenough")).toBe("")
  })
})
