// alerts.js
// Every kind of app-wide alert (modalStore.mainAlert, drawn by AlertModal). Plain functions, so hooks,
// callbacks and handlers all show them the same way (useAlert returns them for components).
// One alert shows at a time: one that comes while another is open waits its turn (modalStore.alertQueue),
// and the same alert is not queued twice. Each show returns the alert's id, so its owner can close just it.
// Titles, texts and button labels are translation keys (already translated text passes unchanged).
import useModalStore from "./modalStore"
import { translate } from "../Helpers/language.utils"

let lastId = 0
const sameAlert = (a, b) => Boolean(a && b) && a.type === b.type && a.title === b.title && a.text === b.text

// shows the alert now, or after the ones before it; its id (the same alert already shown or waiting: that one's)
const setAlert = (fields) => {
  const alert = { ...fields, id: ++lastId, open: true }
  const { mainAlert: shown, alertQueue } = useModalStore.getState()
  if (!shown.open) {
    useModalStore.setState({ mainAlert: alert })
    return alert.id
  }
  const same = [shown, ...alertQueue].find((other) => sameAlert(other, alert))
  if (same) return same.id
  useModalStore.setState({ alertQueue: [...alertQueue, alert] })
  return alert.id
}

// closes the alert shown (or, given its id, that alert, shown or waiting); the next waiting one shows.
// forget: the closed alert's content goes too (otherwise it stays while the alert slides out)
const close = (id, forget) =>
  useModalStore.setState((state) => {
    const shown = state.mainAlert
    if (id != null && shown.id !== id) return { alertQueue: state.alertQueue.filter((waiting) => waiting.id !== id) }
    const [next, ...rest] = state.alertQueue
    if (next) return { mainAlert: next, alertQueue: rest }
    return { mainAlert: forget ? { open: false } : { ...shown, open: false } }
  })

// an alert with no buttons yet
const blank = (type, title, text) => ({
  open: true,
  type,
  title: translate(title),
  text: translate(text),
  okText: null,
  cancelText: null,
  proceedText: null,
  proceedAction: null
})

// closes the alert (the one shown, or the one with this id), keeping what it showed while it slides out
export const closeAlert = (id) => close(id, false)

// closes it and forgets it
export const hideAlert = (id) => close(id, true)

// any other alert: fields over the blank one (the notification router builds its own)
export const showAlert = (fields) => setAlert({ ...blank("error", null, null), ...fields })

// OK closes it
export const showError = (title, text) => setAlert({ ...blank("error", title, text), okText: translate("common.ok") })
export const showSuccess = (title, text) => setAlert({ ...blank("success", title, text), okText: translate("common.ok") })

// one button (OK unless named) that closes it, then runs then() (e.g. brings a modal back, opens a screen)
export const showThen = (type, title, text, then, button = "OK") =>
  setAlert({
    ...blank(type, title, text),
    proceedText: translate(button),
    proceedAction: () => {
      closeAlert()
      if (then) then()
    }
  })
export const showErrorThen = (title, text, then) => showThen("error", title, text, then)
export const showSuccessThen = (title, text, then) => showThen("success", title, text, then)

// a question: confirmText runs onConfirm after closing; cancelText adds a button that only closes, showClose an X
export const askToConfirm = ({ title, text, confirmText = "CONFIRM", onConfirm, cancelText = null, showClose = false, type = "error" }) =>
  setAlert({
    ...blank(type, title, text),
    showClose,
    cancelText: cancelText ? translate(cancelText) : null,
    proceedText: translate(confirmText),
    proceedAction: () => {
      closeAlert()
      onConfirm()
    }
  })

// an error whose only button (the red one) closes it
export const showNotice = (title, text, button = "OK") => setAlert({ ...blank("error", title, text), cancelText: translate(button) })

// an error with no button: it stays until the app closes it by its id (e.g. while offline)
export const showBlocking = (title, text) => setAlert(blank("error", title, text))

// Android back on Home: ask before leaving the app
export const askToExitApp = (exit) =>
  askToConfirm({ title: "alerts.confirmExitApp", text: "alerts.areYouSureThatYouWant", cancelText: "common.cancel", confirmText: "alerts.exit", onConfirm: exit })

// a tasker whose account isn't verified yet; OK runs openLicences (their profile's documents)
export const explainUnverifiedTasker = (openLicences) =>
  showErrorThen("alerts.yourTaskerAccountIsNotVerified", translate("alerts.pleaseMakeSureThatYourAccount") + ".", openLicences)
