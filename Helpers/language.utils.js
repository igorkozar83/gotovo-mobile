// language.utils.js
// The app's translations (i18n-js): the texts that come with the app (assets/translations.json, EN and SR, so
// the first screen is translated without the network), the server's newer ones (kept on the device for the
// next start), the language saved on the device, and translate().
import { I18n } from "i18n-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

import bundled from "../assets/translations.json"
import messages from "../i18n/messages"
import { reportError } from "./reportError"

// the language of a first start (until one is chosen), and the one a missing translation falls back to
export const FIRST_LANGUAGE = "SR"
const FALLBACK_LANGUAGE = "EN"
const SERVER_TEXTS_KEY = "transl"

export const i18n = new I18n(bundled)

i18n.enableFallback = true
i18n.locale = FIRST_LANGUAGE
i18n.defaultLocale = FALLBACK_LANGUAGE

// the server's translations in use, as kept on the device
let appliedServerTexts = null

const takeServerTexts = (json) => {
  appliedServerTexts = json
  i18n.store(JSON.parse(json))
}

// switches to the language saved on the device (the current one stays when none is saved), with the server's
// texts from the last start
export const initTranslations = async () => {
  if (appliedServerTexts === null) {
    try {
      const kept = await AsyncStorage.getItem(SERVER_TEXTS_KEY)
      if (kept) takeServerTexts(kept)
    } catch (e) {
      reportError(e, "language.utils.kept")
    }
  }
  const saved = await AsyncStorage.getItem("@language")
  if (!saved) return
  i18n.locale = saved
  return true
}

// the server's translations ({ EN, SR, ... }): used from now on and kept for the next start; true when they
// differ from the ones in use (the screens then draw again: uiStore.textsVersion)
export const applyServerTranslations = async (translations) => {
  const json = JSON.stringify(translations)
  if (json === appliedServerTexts) return false
  takeServerTexts(json)
  try {
    await AsyncStorage.setItem(SERVER_TEXTS_KEY, json)
  } catch (e) {
    reportError(e, "language.utils.keep")
  }
  return true
}

// a text by its id (i18n/messages.js) is its English, the key its translations are found by; any other text
// (from the server, built at run time) is its own key
const sourceOf = (text) => (Object.hasOwn(messages, text) ? messages[text] : text)

// an untranslated key comes back as it is; keys have no dots; "|br|" in a translation is a line break.
// options: i18n-js interpolation ({ name: "Ana" } fills %{name}) and plurals ({ count })
export const translate = (text, options = null) => {
  if (!text) return text
  const source = sourceOf(text)
  return i18n.t(source.replace(/\./g, "").trim(), { defaultValue: source, ...options }).replace(/\|br\|/g, "\n")
}

// A counted word in the app's language. English has one form for 1 and one for the rest; Serbian three: 1, 21, 31...
// "zadatak", 2-4, 22-24... "zadatka", the rest (0, 5-20, 25...) "zadataka". forms: the keys of each form (one, few,
// many): English gives "few" and "many" the same words.
export const pluralForm = (count, language = i18n.locale) => {
  const n = Math.abs(Math.trunc(Number(count) || 0))
  if (language !== "SR") return n === 1 ? "one" : "many"
  if (n % 10 === 1 && n % 100 !== 11) return "one"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return "few"
  return "many"
}

export const countWord = (count, forms) => translate(forms[pluralForm(count)])

// the translation of a text that is only a key (a placeholder for words the admin writes): null while it has none,
// so the key itself never shows
export const translatedOrNull = (key) => {
  const missing = {}
  const found = i18n.t(sourceOf(key).replace(/\./g, "").trim(), { defaultValue: missing })
  return found === missing || !found ? null : String(found).replace(/\|br\|/g, "\n")
}
