// IncomeAccountsModal.js
// The tasker's bank account for payouts: owner, address, bank, IBAN, SWIFT and country code, all
// required. Editing fills in the saved account. Confirming closes the modal and saves it.
import React, { useState, useEffect } from "react"
import { StyleSheet, View, Text, TextInput, ScrollView, Platform } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import Button from "../ui/Button"
import useAlert from "../../hooks/useAlert"
import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import { useSaveBankAccount } from "../../hooks/profile/useBankAccount"
import ModalFrame, { CloseX } from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

// the fields as the API names them, in the order shown
const FIELDS = [
  { key: "owner_name", label: "incomeAccountsModal.ownerName", missing: "incomeAccountsModal.pleaseEnterOwnerName" },
  { key: "address", label: "incomeAccountsModal.address", missing: "incomeAccountsModal.pleaseEnterAddress" },
  { key: "bank", label: "incomeAccountsModal.bank", missing: "incomeAccountsModal.pleaseEnterBankName" },
  { key: "iban", label: "incomeAccountsModal.ibanAccountNumber", missing: "incomeAccountsModal.pleaseEnterIbanAccount" },
  { key: "swift", label: "incomeAccountsModal.swift", missing: "incomeAccountsModal.pleaseEnterSwift" },
  { key: "country_code", label: "incomeAccountsModal.countryCode", missing: "incomeAccountsModal.pleaseEnterCountryCode" }
]
// the order the missing ones are listed in (as it always was)
const CHECK_ORDER = ["address", "owner_name", "bank", "iban", "swift", "country_code"]

const EMPTY = Object.fromEntries(FIELDS.map(({ key }) => [key, ""]))

const Field = ({ label, value, onChange }) => (
  <View style={atoms.marginBottom10}>
    <Text style={styles.label}>{translate(label)}</Text>
    <TextInput accessibilityLabel={spokenLabel(label)} style={styles.input} value={value} onChangeText={onChange} blurOnSubmit autoCapitalize="none" autoCorrect={false} />
  </View>
)

/**
 * visible / onClose(): shown or not; getUser(): reloads the user after saving
 * editBankAccount + data: the saved account to edit
 */
const IncomeAccountsModal = ({ visible, onClose, reloadUser, editBankAccount, data }) => {
  const colors = useRoleColors()
  const { showError } = useAlert()
  const [account, setAccount] = useState(EMPTY)

  useEffect(() => {
    setAccount(data && editBankAccount ? Object.fromEntries(FIELDS.map(({ key }) => [key, data[key]])) : EMPTY)
  }, [data, editBankAccount])

  const store = useSaveBankAccount({ onSuccess: () => reloadUser() })

  const confirm = () => {
    const missing = CHECK_ORDER.filter((key) => !account[key]).map((key) => translate(FIELDS.find((field) => field.key === key).missing))
    if (missing.length) return showError("common.addBankAccountError", missing.join("\n"))
    onClose()
    store.run(account)
  }

  return (
    <ModalFrame visible={visible} onRequestClose={onClose} cardStyle={styles.card}>
      <ScrollView
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps={"handled"}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View style={styles.modalIn}>
          <CloseX onPress={onClose} color={colors.textColor} style={styles.closeBtn} />
          <Text accessibilityRole="header" style={[styles.title, { color: colors.bgColor }]}>
            {translate("incomeAccountsModal.addAccount")}
          </Text>
          {FIELDS.map(({ key, label }) => (
            <Field key={key} label={label} value={account[key]} onChange={(value) => setAccount((current) => ({ ...current, [key]: value }))} />
          ))}
          <View style={atoms.marginTop20}>
            <Button title={translate("incomeAccountsModal.confirmAccount")} onPress={confirm}>
              <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color={palette.white} />
            </Button>
          </View>
        </View>
      </ScrollView>
    </ModalFrame>
  )
}

const styles = StyleSheet.create({
  scroll: { borderRadius: 20, overflow: "hidden" },
  card: { marginVertical: 20 },
  modalIn: { width: "100%", borderRadius: 0, paddingHorizontal: 20, paddingBottom: 20 },
  closeBtn: { zIndex: 10, padding: 5, right: 5, top: 5 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 24, textAlign: "center", marginTop: 30, marginBottom: 20, height: Platform.OS === "ios" ? 44 : 40 },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  input: { backgroundColor: palette.gray100, padding: 2, paddingLeft: 5, fontSize: 16, fontFamily: "Montserrat_500Medium", height: Platform.OS === "ios" ? 36 : 32 }
})

export default IncomeAccountsModal
