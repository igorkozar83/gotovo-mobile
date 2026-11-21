// useProfileActions.js
// Changes to the logged-in user's profile (Profile screen). After each change the user is reloaded.
import useUiStore from "../../stores/uiStore"
import useAlert from "../useAlert"
import useApiAction from "../useApiAction"
import { PAYMENT_FIELDS, apiError } from "../../Helpers/apiErrors"
import useReloadUser from "../useReloadUser"
import { updateProfile, deleteUserImage, removeUserAddress, deleteAvatar, removePhone } from "../../Services/UsersAPI"
import { removeCardInfo, removeBankInfo } from "../../Services/PaymentsAPI"
import { askToConfirm } from "../../stores/alerts"

const useProfileActions = ({ onAvatarDeleted, onPhoneRemovedForEdit } = {}) => {
  const { showError } = useAlert()
  const reloadUser = useReloadUser()

  // reload the logged-in user (with the spinner)
  const getUser = async () => {
    const hideSpinner = useUiStore.getState().showSpinner()
    try {
      await reloadUser()
    } finally {
      hideSpinner()
    }
  }

  // fields of the profile; the user is reloaded whatever the server answers, a failed request shows an error
  const updateAction = useApiAction(updateProfile, {
    onSuccess: () => getUser(),
    onError: (error) => {
      if (apiError(error)) return getUser()
      showError("useProfileActions.updateProfileInfoError", "useProfileActions.somethingWentWrongWhileUpdatingProfile")
    }
  })

  const deleteImageAction = useApiAction(deleteUserImage, { error: "useProfileActions.imageDeleteError", spinner: false, onSuccess: () => getUser() })
  const removeAddressAction = useApiAction(removeUserAddress, { error: "useProfileActions.addressDeleteError", spinner: false, onSuccess: () => getUser() })

  const deleteAvatarAction = useApiAction(deleteAvatar, {
    error: "useProfileActions.avatarDeleteError",
    spinner: false,
    onSuccess: () => {
      getUser()
      if (onAvatarDeleted) onAvatarDeleted()
    }
  })

  const removePhoneAction = useApiAction(removePhone, { error: "useProfileActions.phoneNumberDeleteError", onSuccess: () => getUser() })

  // editing the phone = removing it and verifying a new one
  const removePhoneForEditAction = useApiAction(removePhone, {
    error: "useProfileActions.phoneNumberDeleteError",
    onSuccess: () => {
      getUser()
      if (onPhoneRemovedForEdit) onPhoneRemovedForEdit()
    }
  })

  const confirmEditPhone = () =>
    askToConfirm({
      title: "useProfileActions.phoneNumberEditConfirm",
      text: "useProfileActions.yourPhoneNumberWillBeDeleted",
      cancelText: "common.cancel",
      confirmText: "useProfileActions.proceed",
      onConfirm: () => removePhoneForEditAction.run()
    })

  const removeCardAction = useApiAction(removeCardInfo, {
    error: "useProfileActions.removeCardInfoError",
    invalid: PAYMENT_FIELDS,
    failedTitle: "useProfileActions.addCardInfoError",
    failed: "useProfileActions.thereWasAnErrorWhileRemovingCard",
    onSuccess: () => getUser()
  })

  const removeBankAction = useApiAction(removeBankInfo, {
    error: "useProfileActions.removeBankInfoError",
    invalid: PAYMENT_FIELDS,
    failedTitle: "common.addBankAccountError",
    failed: "useProfileActions.thereWasAnErrorWhileRemovingBank",
    onSuccess: () => getUser()
  })

  return {
    getUser,
    // { full_name, last_name, about, age, gender, languages }: any of them
    updateProfile: (fields) => updateAction.run(fields),
    doDeleteUserImage: (id) => deleteImageAction.run(id),
    removeAddress: (id) => removeAddressAction.run(id),
    doDeleteAvatar: () => deleteAvatarAction.run(),
    doRemovePhone: () => removePhoneAction.run(),
    checkDoEditPhone: confirmEditPhone,
    doRemoveCardInfo: (id) => removeCardAction.run(id),
    doRemoveBankInfo: (id) => removeBankAction.run(id)
  }
}

export default useProfileActions
