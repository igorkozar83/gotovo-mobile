import useModalStore from "../modalStore"
import { showError, showSuccessThen, askToConfirm, showNotice, showBlocking, closeAlert, hideAlert, explainUnverifiedTasker, showAlert } from "../alerts"

const alert = () => useModalStore.getState().mainAlert

beforeEach(() => useModalStore.setState({ mainAlert: { open: false }, alertQueue: [] }))

describe("app alerts", () => {
  it("an error has only OK", () => {
    showError("Login error", "Wrong password")
    expect(alert()).toMatchObject({ open: true, type: "error", title: "Login error", text: "Wrong password", okText: "OK", cancelText: null, proceedText: null })
  })

  it("a success whose button closes it, then goes on", () => {
    const then = jest.fn()
    showSuccessThen("YOU HAVE POSTED A TASK", "", then)
    expect(alert()).toMatchObject({ type: "success", proceedText: "OK", okText: null })
    alert().proceedAction()
    expect(alert().open).toBe(false)
    expect(alert().title).toBe("YOU HAVE POSTED A TASK")
    expect(then).toHaveBeenCalled()
  })

  it("a question runs its answer after closing; cancel only closes", () => {
    const onConfirm = jest.fn(() => expect(alert().open).toBe(false))
    askToConfirm({ title: "Task cancelation", text: "Sure?", cancelText: "CANCEL", showClose: true, onConfirm })
    expect(alert()).toMatchObject({ showClose: true, cancelText: "CANCEL", proceedText: "CONFIRM", okText: null })
    alert().proceedAction()
    expect(onConfirm).toHaveBeenCalled()
  })

  it("a notice has only the red button; a blocking alert has none", () => {
    showNotice("Account disabled", "Contact us")
    expect(alert()).toMatchObject({ cancelText: "OK", okText: null, proceedText: null })
    hideAlert()
    showBlocking("Connection problem", "Offline")
    expect(alert()).toMatchObject({ open: true, okText: null, cancelText: null, proceedText: null })
  })

  it("an alert that comes while another is open waits for it; the same one is not queued twice", () => {
    showError("First", "One")
    showError("Second", "Two")
    showError("Second", "Two")
    showError("First", "One")
    expect(alert().title).toBe("First")
    hideAlert()
    expect(alert()).toMatchObject({ open: true, title: "Second" })
    hideAlert()
    expect(alert()).toEqual({ open: false })
  })

  it("an alert's owner closes just it, shown or waiting", () => {
    const offline = showBlocking("Connection problem", "Offline")
    const error = showError("Login error", "Wrong password")
    hideAlert(error)
    expect(alert().title).toBe("Connection problem")
    showError("Login error", "Wrong password")
    hideAlert(offline)
    expect(alert()).toMatchObject({ open: true, title: "Login error" })
  })

  it("showing an alert that is already there gives that alert's id", () => {
    const first = showBlocking("Connection problem", "Offline")
    expect(showBlocking("Connection problem", "Offline")).toBe(first)
    hideAlert(first)
    expect(alert().open).toBe(false)
  })

  it("closing keeps what it showed; hiding forgets it", () => {
    showError("A", "B")
    closeAlert()
    expect(alert()).toMatchObject({ open: false, title: "A" })
    hideAlert()
    expect(alert()).toEqual({ open: false })
  })

  it("an unverified tasker is sent to their licences", () => {
    const openLicences = jest.fn()
    explainUnverifiedTasker(openLicences)
    expect(alert().title).toBe("YOUR TASKER ACCOUNT IS NOT VERIFIED")
    alert().proceedAction()
    expect(openLicences).toHaveBeenCalled()
  })

  it("any other alert starts from a blank one", () => {
    showAlert({ type: "success", title: "Custom", okText: "OK" })
    expect(alert()).toMatchObject({ open: true, type: "success", title: "Custom", okText: "OK", cancelText: null })
  })
})
