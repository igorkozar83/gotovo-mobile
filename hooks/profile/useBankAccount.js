// useBankAccount.js
// Saving the tasker's bank account for payouts.
import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import { storeBankAccount } from "../../Services/PaymentsAPI"
import { PAYMENT_FIELDS } from "../../Helpers/apiErrors"
import { translate } from "../../Helpers/language.utils"

// run({ owner_name, address, bank, iban, swift, country_code })
export const useSaveBankAccount = ({ onSuccess } = {}) => {
  const { showSuccess } = useAlert()
  return useApiAction(storeBankAccount, {
    error: "common.addBankAccountError",
    invalid: PAYMENT_FIELDS,
    failed: "useBankAccount.thereWasAnErrorWhileAdding",
    onSuccess: (...args) => {
      if (onSuccess) onSuccess(...args)
      showSuccess("useBankAccount.incomeAccountInfoEdited", translate("useBankAccount.incomeAccountInfoEditedSuccessfully") + ".")
    }
  })
}
