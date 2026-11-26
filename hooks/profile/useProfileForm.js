// useProfileForm.js
// The profile's general data while the user edits it. Every change is saved on its own: a text field
// when its editing ends (if it changed), a choice (sex, year, language) right away.
import { useEffect, useState } from "react"

import useAuthStore from "../../stores/authStore"
import useAlert from "../useAlert"
import useProfileActions from "./useProfileActions"
import { personName } from "../../Helpers/validation"

// the languages that have their own checkbox (others are picked from the list)
const OWN_CHECKBOX = { Srpski: "sr", English: "en", Czech: "cz" }

const fromUser = (userData = {}) => {
  const fields = {
    name: userData.name || "",
    lastName: userData.last_name || "",
    about: userData.about || "",
    sex: userData.gender ?? null,
    age: userData.age ? userData.age + "" : "",
    languages: { sr: false, en: false, cz: false, other: "" }
  }
  ;(userData.languages || []).forEach(({ language }) => {
    if (OWN_CHECKBOX[language]) fields.languages[OWN_CHECKBOX[language]] = true
    else fields.languages.other = language
  })
  return fields
}

const NAME_KEYS = ["name", "lastName"]

// the text fields: their column and what makes them invalid
const TEXT_FIELDS = {
  name: { column: "full_name", invalid: (value) => (!value ? "Please enter valid name." : null) },
  lastName: { column: "last_name", invalid: (value) => (!value ? "Please enter valid last name." : null) },
  about: { column: "about", invalid: () => null }
}

const invalidYear = (year) => {
  const number = Number.parseInt(year)
  return Number.isNaN(number) || number < 1900 ? "Age must be a number bigger than 1900." : null
}

// the languages the user speaks, by name (the one they typed first)
const spokenLanguages = ({ sr, en, cz, other }) => [other, en && "English", cz && "Czech", sr && "Srpski"].filter(Boolean)

const useProfileForm = () => {
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const userData = useAuthStore((state) => state.user.userData)
  const { showError } = useAlert()
  const { updateProfile } = useProfileActions()
  const [fields, setFields] = useState(() => fromUser(userData))

  // the reloaded user (after a save) is what the form shows
  useEffect(() => {
    if (loggedIn) setFields(fromUser(userData))
  }, [loggedIn, userData])

  const saveOrWarn = (error, column, value) => {
    if (error) return showError("useProfileForm.updateProfileInfoError", error)
    updateProfile({ [column]: value })
  }

  // (the name fields take only what a name can hold)
  const setText = (key, value) => setFields((current) => ({ ...current, [key]: NAME_KEYS.includes(key) ? personName(value) : value }))

  const endEditing = (key) => {
    const value = fields[key]
    if (value === fromUser(userData)[key]) return
    const { column, invalid } = TEXT_FIELDS[key]
    saveOrWarn(invalid(value), column, value)
  }

  const chooseSex = (sex) => {
    setFields((current) => ({ ...current, sex }))
    updateProfile({ gender: sex === "" ? null : sex })
  }

  const chooseYear = (year) => {
    setFields((current) => ({ ...current, age: year + "" }))
    saveOrWarn(invalidYear(year), "age", year)
  }

  const changeLanguages = (change) => {
    const languages = { ...fields.languages, ...change }
    setFields((current) => ({ ...current, languages }))
    updateProfile({ languages: spokenLanguages(languages) })
  }

  return {
    fields,
    setText,
    endEditing,
    chooseSex,
    chooseYear,
    toggleLanguage: (key) => changeLanguages({ [key]: !fields.languages[key] }),
    chooseOtherLanguage: (other) => changeLanguages({ other })
  }
}

export default useProfileForm
