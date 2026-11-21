// useAlert.js
// The app-wide alerts for components and hooks (stores/alerts; Main renders modalStore.mainAlert).
// The functions are the same on every render, so effects can depend on them.
import * as alerts from "../stores/alerts"

const ALERTS = {
  showError: alerts.showError,
  showSuccess: alerts.showSuccess,
  showErrorThen: alerts.showErrorThen,
  showSuccessThen: alerts.showSuccessThen,
  askToConfirm: alerts.askToConfirm,
  showNotice: alerts.showNotice,
  close: alerts.hideAlert
}

const useAlert = () => ALERTS

export default useAlert
