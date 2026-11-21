import { validationMessage, serverMessages, requiredFieldsMessage, PAYMENT_FIELDS, accountFailure, apiError, invalidFields } from "../apiErrors"

// an axios error with the API v2's error answer
const refused = (status, code, message, fields) => ({ response: { status, data: { error: { code, message, ...(fields ? { fields } : {}) } } } })
// an invalid form with these fields
const invalid = (fields) => refused(422, "invalid", "The given data was invalid.", fields)

describe("apiError", () => {
  it("reads the v2 error with its status", () => {
    expect(apiError(refused(404, "not_found", "Task not found."))).toEqual({ status: 404, code: "not_found", message: "Task not found.", fields: null, reason: null })
    expect(apiError(invalid({ price: ["validation.required"] })).fields).toEqual({ price: ["validation.required"] })
  })

  it("is null for a network error or a page that is no API answer", () => {
    expect(apiError(new Error("Network Error"))).toBeNull()
    expect(apiError({ response: { status: 502, data: "<html>Bad gateway</html>" } })).toBeNull()
  })

  it("only an invalid form has invalid fields", () => {
    expect(invalidFields(invalid({ name: ["required"] }))).toEqual({ name: ["required"] })
    expect(invalidFields(refused(422, "refused", "Too late"))).toBeNull()
  })
})

describe("validationMessage", () => {
  it("asks for each invalid field, one per line", () => {
    expect(validationMessage(invalid({ name: ["required"], email: ["required"] }))).toBe("Please enter name.\nPlease enter email.")
  })

  it("uses the generic message for 'message' and names fields as told", () => {
    expect(validationMessage(invalid({ message: ["x"], country_code: ["required"] }), { messageKey: "Try again", ...PAYMENT_FIELDS })).toBe("Try again\nPlease enter COUNTRY CODE.")
  })

  it("is null without a field list", () => {
    expect(validationMessage(new Error("Network Error"))).toBeNull()
    expect(validationMessage(refused(500, "server_error", "Server Error"))).toBeNull()
  })
})

describe("serverMessages", () => {
  it("lists the server's messages", () => {
    expect(serverMessages(invalid({ email: ["Email taken"], phone: ["Bad phone"] }))).toBe("Email taken\nBad phone")
  })

  it("lists only known messages, as their text", () => {
    const known = { "validation.unique": "Already registered" }
    expect(serverMessages(invalid({ email: ["validation.unique"], name: ["other"] }), known)).toBe("Already registered")
    expect(serverMessages(invalid({ name: ["other"] }), known)).toBeNull()
  })
})

describe("requiredFieldsMessage", () => {
  it("names each field as required", () => {
    expect(requiredFieldsMessage(invalid({ message: ["x"], date: ["x"] }))).toBe("Message field is required.\nDate field is required.")
  })

  it("is null without a field list", () => {
    expect(requiredFieldsMessage({})).toBeNull()
  })
})

describe("accountFailure", () => {
  it("calls a disabled account so, and a deleted one deleted", () => {
    expect(accountFailure("Login Error")(refused(401, "account_disabled", "Your account is disabled"))).toEqual({
      title: "common.accountDisabled",
      text: "Your account is disabled"
    })
    const deleted = { response: { status: 401, data: { error: { code: "account_disabled", message: "Your account has been deleted.", reason: "deleted" } } } }
    expect(accountFailure("Login Error")(deleted)).toEqual({ title: "common.accountIsDeleted", text: "Your account has been deleted." })
  })

  it("titles any other failure as given", () => {
    expect(accountFailure("Login Error")(invalid({ email: ["required"] }))).toEqual({ title: "Login Error", text: "Please enter email." })
  })
})
