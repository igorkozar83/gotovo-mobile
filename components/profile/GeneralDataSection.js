// GeneralDataSection.js
// The profile's general data: name, about, spoken languages, sex and year of birth (saved as edited).
import React from "react"
import { View, Text, TextInput, Platform, StyleSheet } from "react-native"
import ModalSelector from "react-native-modal-selector"
import { Entypo } from "@expo/vector-icons"

import SectionTitle from "./SectionTitle"
import CustomDropDown from "../ui/CustomDropDown"
import { CheckBox, RadioDot } from "../ui/ChoiceControls"
import useProfileForm from "../../hooks/profile/useProfileForm"
import { translate } from "../../Helpers/language.utils"
import languages from "../../data/Languages"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"
import { atoms } from "../../styles/atoms"

const LANGUAGE_NAMES = Object.values(languages).map((language) => language.name)
const SEXES = [
  { value: 0, label: "generalDataSection.male" },
  { value: 1, label: "generalDataSection.female" },
  { value: 2, label: "generalDataSection.other" }
]

// the year-of-birth picker: 1950 up to this year
const years = () => {
  const options = [{ key: 0, section: true, label: translate("generalDataSection.yearOfBirthYearSelect") }]
  for (let year = 1950; year <= new Date().getFullYear(); year++) options.push({ key: year, label: "" + year })
  return options
}

const GeneralDataSection = () => {
  const { fields, setText, endEditing, chooseSex, chooseYear, toggleLanguage, chooseOtherLanguage } = useProfileForm()

  const textField = (key, style) => ({
    style,
    value: fields[key],
    onChangeText: (value) => setText(key, value),
    onEndEditing: () => endEditing(key),
    blurOnSubmit: true,
    autoCapitalize: "none",
    autoCorrect: false
  })

  return (
    <>
      <SectionTitle title={"GENERAL DATA"} tip={"Tooltip 1 general data (profile)"} />
      <View style={styles.field}>
        <TextInput accessibilityLabel={spokenLabel("generalDataSection.firstName")} {...textField("name", styles.nameInput)} />
      </View>
      <View style={styles.nameField}>
        <TextInput accessibilityLabel={spokenLabel("generalDataSection.lastName")} {...textField("lastName", styles.nameInput)} />
      </View>
      <View>
        <Text style={styles.label}>{translate("generalDataSection.aboutMyself")}</Text>
        <TextInput accessibilityLabel={spokenLabel("generalDataSection.aboutMyself")} {...textField("about", styles.aboutInput)} />
        <Entypo name="triangle-right" size={24} color={palette.gray350} style={styles.aboutCorner} />
      </View>

      <Text style={[styles.label, styles.fieldLabel]}>{translate("generalDataSection.spokenLanguages")}</Text>
      <View style={styles.languages}>
        <View style={styles.languageRow}>
          <Text style={styles.languageName}>{translate("generalDataSection.srpski")}</Text>
          <CheckBox accessibilityLabel={translate("generalDataSection.srpski")} checked={fields.languages.sr} onPress={() => toggleLanguage("sr")} style={atoms.marginRight20} />
        </View>
        <View style={styles.languageRow}>
          <Text style={styles.languageName}>{translate("generalDataSection.english")}</Text>
          <CheckBox accessibilityLabel={translate("generalDataSection.english")} checked={fields.languages.en} onPress={() => toggleLanguage("en")} />
        </View>
      </View>

      <Text style={[styles.label, styles.fieldLabel]}>{translate("generalDataSection.moreSpokenLanguages")}</Text>
      <View style={styles.dropdown}>
        <CustomDropDown title={fields.languages.other} options={LANGUAGE_NAMES} callback={chooseOtherLanguage} />
      </View>

      <View style={styles.sexRow}>
        <View style={styles.sexOptions}>
          <Text style={[styles.label, atoms.marginRight5]}>{translate("generalDataSection.sex")}</Text>
          {SEXES.map(({ value, label }) => (
            <View key={value} style={styles.sexOption}>
              <Text style={[styles.label, atoms.marginRight5]}>{translate(label)}</Text>
              <RadioDot accessibilityLabel={spokenLabel(label)} selected={fields.sex === value} onPress={() => chooseSex(value)} />
            </View>
          ))}
          <Text style={[styles.label, styles.birthYear]}>{translate("generalDataSection.yearOfBirth")}</Text>
        </View>
        <View style={styles.helpIcon}>
          <ModalSelector
            data={years()}
            initValue={"select year"}
            onChange={(option) => chooseYear(parseInt(option.label))}
            cancelText={translate("generalDataSection.cancelButtonYear")}
            style={atoms.flex1}
          >
            <TextInput
              accessibilityLabel={spokenLabel("generalDataSection.yearOfBirth")}
              style={[styles.yearInput, Platform.OS !== "ios" && styles.yearInputAndroid]}
              editable={false}
              placeholder={fields.age + ""}
              value={fields.age + ""}
            />
          </ModalSelector>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  field: { marginBottom: 10, marginTop: 10 },
  nameField: { marginTop: 5, marginBottom: 10 },
  fieldLabel: { marginBottom: 5, marginTop: 10 },
  dropdown: { marginBottom: 10, zIndex: 99 },
  sexOption: { flexDirection: "row", alignItems: "center" },
  helpIcon: { top: 3, marginLeft: 5 },
  languages: { flexDirection: "row", height: 32.5, justifyContent: "space-between", paddingLeft: 5 },
  sexRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  sexOptions: { flexDirection: "row", alignItems: "center", flexGrow: 1, width: "85%", position: "relative", top: 3 },
  birthYear: { textAlign: "right", marginLeft: "auto", marginRight: 0 },
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular" },
  nameInput: { borderBottomColor: palette.black, borderRadius: 5, borderBottomWidth: 1, fontFamily: "Montserrat_600SemiBold", paddingLeft: 5, fontSize: 22 },
  aboutInput: { backgroundColor: palette.gray100, borderRadius: 5, padding: 10, paddingLeft: 5, fontSize: 16, fontFamily: "Montserrat_500Medium", textAlignVertical: "top" },
  aboutCorner: { position: "absolute", bottom: -3, right: -3, transform: [{ rotateZ: "40deg" }] },
  languageRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "50%" },
  languageName: { fontSize: 16, paddingLeft: 5, fontFamily: "Montserrat_500Medium" },
  yearInput: {
    borderWidth: 0,
    borderColor: palette.transparent,
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    minWidth: 40,
    padding: 5,
    backgroundColor: palette.gray200,
    borderRadius: 5,
    height: 28
  },
  yearInputAndroid: { minWidth: 36, width: 36, height: 20, borderRadius: 5, lineHeight: 20, padding: 5, paddingTop: 0, paddingBottom: 0 }
})

export default GeneralDataSection
