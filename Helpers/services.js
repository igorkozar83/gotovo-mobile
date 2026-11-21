// services.js
// The client Home's services: those of the chosen category (0 = featured), matching the search in the
// app's language, also without Serbian diacritics.
import { allReplace } from "./index"
import { translate } from "./language.utils"

const PLAIN = { ž: "z", ć: "c", č: "c", š: "s", đ: "d", Ž: "Z", Ć: "C", Č: "C", Š: "S", Đ: "D" }

const inCategory = (service, category) => (category === 0 ? parseInt(service.featured) !== 0 : parseInt(service.categoryId) === parseInt(category))

// services: appSettings.services; category: the chosen category id; search: the typed text
export const filterServices = (services, category, search) => {
  const shown = (services || []).filter((service) => inCategory(service, category))
  if (!search) return shown
  const text = search.toLowerCase()
  return shown.filter((service) => {
    const words = (translate(service.blackText) + " " + translate(service.additionalText)).toLowerCase()
    return words.indexOf(text) > -1 || allReplace(words, PLAIN).indexOf(text) > -1
  })
}
