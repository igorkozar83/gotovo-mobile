import { registerProblems, EMPTY_FORM } from "../auth/useRegisterForm"
import { loginProblems } from "../auth/useLoginForm"

jest.mock("../../Services/API", () => ({}))
jest.mock("../../Services/UsersAPI", () => ({}))
jest.mock("../../Services/socialSignIn", () => ({}))

const valid = { name: "Ana", lastname: "Anić", email: "ana@example.rs", password: "12345678", confirmPassword: "12345678" }

describe("register form checks", () => {
  it("a complete form with the terms accepted passes", () => {
    expect(registerProblems(valid, true)).toBe("")
  })

  it("lists every problem of an empty form", () => {
    const problems = registerProblems(EMPTY_FORM, false)
    expect(problems).toContain("Please enter valid email.")
    expect(problems).toContain("Minimum password length is 8.")
    expect(problems).toContain("Please enter name")
    expect(problems).toContain("Please accept terms & conditions")
    expect(problems).toContain("Please enter last name")
  })

  it("the passwords have to match", () => {
    expect(registerProblems({ ...valid, confirmPassword: "87654321" }, true)).toContain("Password and confirm password do not match.")
  })
})

describe("login form checks", () => {
  it("a valid email and an 8 character password pass", () => {
    expect(loginProblems("ana@example.rs", "12345678")).toBe("")
  })

  it("a bad email and a short password are both named", () => {
    const problems = loginProblems("ana@", "123")
    expect(problems).toContain("Please enter valid email")
    expect(problems).toContain("Minimum password length is 8")
  })
})
