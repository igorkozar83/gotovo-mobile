// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")
const prettierConfig = require("eslint-config-prettier")
const globals = require("globals")

const NO_COLOR_LITERALS = { selector: "Literal[value=/^(#[0-9a-fA-F]{3,8}|rgba?\(.*\))$/]", message: "Use a color from styles/palette." }

// style={{ ... }} or style={[..., { ... }]} with only literal (or palette) values, no spread
const STYLE_OBJECT = "JSXAttribute[name.name=/[sS]tyle$/] > JSXExpressionContainer"
const FIXED = "[properties.length>0]:not(:has(> SpreadElement)):not(:has(> Property[value.type!='Literal'][value.type!='UnaryExpression'][value.object.name!='palette']))"
const NO_FIXED_INLINE_STYLES = [`${STYLE_OBJECT} > ObjectExpression${FIXED}`, `${STYLE_OBJECT} > ArrayExpression > ObjectExpression${FIXED}`].map((selector) => ({
  selector,
  message: "A fixed style goes in a StyleSheet (styles/atoms for one property)."
}))

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // the browser's StyleSheet (a DOM type) is not React Native's: a missing import must be an error
    languageOptions: { globals: { StyleSheet: "off" } }
  },
  {
    // colors come from styles/palette (or useRoleColors), never as literals
    files: ["components/**/*.js", "screens/**/*.js", "styles/**/*.js", "hooks/**/*.js", "Helpers/**/*.js", "Services/**/*.js", "stores/**/*.js"],
    ignores: ["styles/palette.js", "**/__tests__/**"],
    rules: { "no-restricted-syntax": ["error", NO_COLOR_LITERALS] }
  },
  {
    // ...and in the components and screens, a style made only of fixed values belongs in a StyleSheet: the
    // component's own, or styles/atoms for one property (styles that depend on props or state stay inline)
    // (one rule entry: a second no-restricted-syntax for these files would replace the colors one)
    files: ["components/**/*.js", "screens/**/*.js"],
    ignores: ["**/__tests__/**"],
    rules: { "no-restricted-syntax": ["error", NO_COLOR_LITERALS, ...NO_FIXED_INLINE_STYLES] }
  },
  {
    // Jest's describe/it/expect/jest in the tests and their setup
    files: ["**/__tests__/**/*.js", "jest.setup.js", "testUtils/**/*.js"],
    languageOptions: { globals: { ...globals.jest, ...globals.node } }
  },
  {
    ignores: ["android/*", "ios/*", "dist/*", "node_modules/*", "plugins/*"]
  }
])
