// slides.js
// A Home slide in the app's language: its texts and picture in that language where the admin gave them
// (slide.translations: { "EN": { text, black_text, ..., button_text, image } } for every language of the settings
// but Serbian), else the slide's own (Serbian) ones.
const TRANSLATED = ["text", "black_text", "top_text", "middle_text", "subtitle", "bottom_text", "button_text", "image"]

export const slideIn = (slide, language) => {
  const own = (slide.translations || {})[language]
  if (!own) return slide
  const given = TRANSLATED.filter((name) => own[name]).map((name) => [name, own[name]])
  return { ...slide, ...Object.fromEntries(given) }
}
