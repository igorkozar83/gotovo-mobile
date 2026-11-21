// PaymentSummary.js
// The payment modal's table: what is paid (the Gotovo fee for the task, or the task price) and the total,
// and a note on the other amount.
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import { localPriceFixed } from "../../Helpers"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

// an amount as prices show it ("" while it is not known)
const money = (amount) => (amount === null || amount === undefined || amount === "" ? "" : localPriceFixed(parseInt(amount)))

// one row of the table: its description on the left, an amount with the currency on the right
const AmountRow = ({ children, amount, currency }) => (
  <View style={styles.row}>
    <View style={styles.col}>{children}</View>
    <View style={[styles.col, styles.colAmount]}>
      <Text style={[styles.bold, styles.price]}>
        {amount}
        {" "}
        <Text style={styles.currency}>{currency}</Text>
      </Text>
    </View>
  </View>
)

/**
 * task: the task; known: the offer is known; price: its price; fee: the Gotovo fee
 * taskPrice: the task price is paid (not the fee); currency: shown in the table; settingsCurrency: in the note
 */
const PaymentSummary = ({ task, known, price, fee, taskPrice, currency, settingsCurrency }) => (
  <>
    <View style={styles.tableHead}>
      <Text style={styles.headText}>{translate("paymentSummary.description")}</Text>
      <Text style={styles.headText}>{translate("paymentSummary.amount")}</Text>
    </View>
    <View style={styles.amountPart}>
      {known ? (
        <AmountRow amount={money(taskPrice ? price : fee)} currency={currency}>
          <Text style={styles.description}>{taskPrice ? task.name : translate("paymentSummary.gotovoServiceCommitmentFeeFor", { name: task.name })}</Text>
        </AmountRow>
      ) : null}
    </View>
    {known ? (
      <AmountRow amount={taskPrice ? money(price) : price ? money(fee) : ""} currency={currency}>
        <Text style={styles.bold}>{translate("paymentSummary.total")}</Text>
      </AmountRow>
    ) : null}
    <View style={styles.noteBlock}>
      <Text style={styles.note}>
        {taskPrice
          ? translate("paymentSummary.youHaveAlreadyPaidTheGotovo", { amount: money(fee) + " " + settingsCurrency })
          : translate("paymentSummary.theTaskPriceOfIsTo", { amount: money(price) + " " + settingsCurrency })}
      </Text>
    </View>
  </>
)

const styles = StyleSheet.create({
  tableHead: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", backgroundColor: palette.gray100, paddingTop: 5 },
  headText: { marginHorizontal: 22, fontFamily: "Montserrat_400Regular", fontSize: 10, marginBottom: 4 },
  amountPart: { paddingBottom: 20, borderBottomColor: palette.black, borderBottomWidth: 1 },
  row: { flexDirection: "row", paddingVertical: 14, alignItems: "center" },
  col: { width: "45%" },
  colAmount: { flexDirection: "row", width: "55%" },
  description: { fontSize: 14, fontFamily: "Montserrat_400Regular", textAlign: "left" },
  bold: { fontFamily: "Montserrat_700Bold", fontSize: 16, width: "100%" },
  price: { flexDirection: "row", fontSize: 22, textAlign: "right" },
  currency: { fontFamily: "Montserrat_500Medium", fontSize: 16, textAlign: "right" },
  noteBlock: { marginBottom: 20 },
  note: { fontFamily: "Montserrat_700Bold", fontSize: 16 }
})

export default PaymentSummary
