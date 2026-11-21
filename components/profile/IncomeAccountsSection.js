// IncomeAccountsSection.js
// A tasker's saved card and bank account (where their income is paid). Payments are off in the app for
// now; the section is shown on the IncomeAccounts screen, opened from the side menu while they are on.
import React from "react"
import { View, Text, Dimensions, TouchableWithoutFeedback, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import TitleWithBorder from "../ui/TitleWithBorder"
import Button from "../ui/Button"
import { RemoveButton, EditButton } from "../ui/RoundIconButton"
import useAuthStore from "../../stores/authStore"
import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const IncomeAccountsSection = ({ onRemoveCard, onRemoveBank, onEditBank, onAddBank }) => {
  const navigation = useNavigation()
  const colors = useRoleColors()
  const userData = useAuthStore((state) => state.user.userData)
  const card = userData?.user_payment_infos?.[0]
  const bank = userData?.user_bank_account_infos?.[0]

  return (
    <View style={{ minHeight: Dimensions.get("screen").height - 280 }}>
      <View style={styles.title}>
        <TitleWithBorder title={translate("incomeAccountsSection.savedAccounts")} />
      </View>
      {card ? (
        <View style={styles.row}>
          <Text style={styles.account}>
            {card.type[0].toUpperCase() + card.type.substring(1)} **** **** **** {card.last_4}
          </Text>
          <View style={styles.actions}>
            <RemoveButton onPress={() => onRemoveCard(card.id)} />
          </View>
        </View>
      ) : null}
      {bank ? (
        <View style={styles.row}>
          <Text style={[styles.account, atoms.width230]} ellipsizeMode="tail" numberOfLines={1}>
            {bank.bank} {bank.iban}
          </Text>
          <View style={styles.actions}>
            <RemoveButton onPress={() => onRemoveBank(bank.id)} />
            <EditButton onPress={() => onEditBank(bank)} />
          </View>
        </View>
      ) : (
        <View style={styles.addBlock}>
          <Button onPress={onAddBank} title={"incomeAccountsSection.addBankAccount"}>
            <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color={palette.white} />
          </Button>
        </View>
      )}
      <View>
        <Text style={styles.note}>
          {translate("incomeAccountsSection.toFindOutHowWeProcess")}
          {"\n"}
          {translate("incomeAccountsSection.read")}{" "}
          <TouchableWithoutFeedback onPress={() => navigation.navigate("TermsAndConditions")}>
            <Text style={{ fontFamily: "Montserrat_700Bold", color: colors.bgColor }}>{translate("incomeAccountsSection.gotovoTermsConditions")}.</Text>
          </TouchableWithoutFeedback>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", marginLeft: "auto" },
  addBlock: { marginBottom: 20, marginTop: 10 },
  title: { position: "relative", marginTop: 20, marginBottom: 10 },
  note: { fontFamily: "Montserrat_400Regular", fontSize: 10, paddingLeft: 10 },
  row: { position: "relative", paddingLeft: 10, marginBottom: 20, flexDirection: "row", alignItems: "center" },
  account: { padding: 10, borderRadius: 5, fontFamily: "Montserrat_500Medium", paddingLeft: 5, fontSize: 16 }
})

export default IncomeAccountsSection
