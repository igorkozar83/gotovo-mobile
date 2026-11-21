// accessibility.js
// Finds the pressables (Pressable, Touchable*) in components/ and screens/ a screen reader can't name:
// no <Text> of their own (an icon or a picture only), no accessibilityLabel, not a checkbox / radio with
// its state, and not taken out of the accessibility tree (accessible={false}); and the fields and choice
// controls (TextInput, CheckBox, RadioDot...) that have no accessibilityLabel.
const fs = require("fs")
const path = require("path")
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default

const PRESSABLES = new Set(["Pressable", "TouchableOpacity", "TouchableWithoutFeedback", "TouchableHighlight"])
const ICON = /Icon|Ionicons|AntDesign|Feather|Entypo|FontAwesome|MaterialCommunityIcons|SimpleLineIcons|Octicons/

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(p)
    return e.name.endsWith(".js") ? [p] : []
  })

const attr = (el, name) => el.openingElement.attributes.find((a) => a.type === "JSXAttribute" && a.name.name === name)
const literal = (a) => a && a.value && (a.value.type === "StringLiteral" ? a.value.value : a.value.expression && a.value.expression.value)

// the element shows words: a <Text> whose children aren't only icons
const hasWords = (p) => {
  let words = false
  p.traverse({
    JSXElement(q) {
      if (q.node.openingElement.name.name !== "Text") return
      const kids = q.node.children.filter((c) => !(c.type === "JSXText" && !c.value.trim()))
      if (!kids.every((c) => c.type === "JSXElement" && ICON.test(c.openingElement.name.name || ""))) {
        words = true
        q.stop()
      }
    }
  })
  return words
}

// each JSX element of the app's components and screens, with its file
const eachElement = (root, visit) => {
  for (const file of [...walk(path.join(root, "components")), ...walk(path.join(root, "screens"))]) {
    const ast = parser.parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: ["jsx"] })
    const where = (el) => path.relative(root, file).split(path.sep).join("/") + ":" + el.loc.start.line
    traverse(ast, { JSXElement: (p) => visit(p, where) })
  }
}

const unnamedPressables = (root) => {
  const found = []
  eachElement(root, (p, where) => {
    const el = p.node
    if (!PRESSABLES.has(el.openingElement.name.name)) return
    if (attr(el, "accessibilityLabel")) return
    if (["checkbox", "radio"].includes(literal(attr(el, "accessibilityRole"))) && attr(el, "accessibilityState")) return
    const accessible = attr(el, "accessible")
    if (accessible && accessible.value && accessible.value.expression && accessible.value.expression.value === false) return
    if (hasWords(p)) return
    found.push(where(el))
  })
  return found
}

// fields and choice controls: their label is a separate <Text>, so a screen reader needs accessibilityLabel
const NEEDS_LABEL = new Set(["TextInput", "CustomTextInput", "CheckBox", "ToggleBox", "RadioDot", "DateRadio"])

const unlabelledFields = (root) => {
  const found = []
  eachElement(root, (p, where) => {
    const el = p.node
    if (!NEEDS_LABEL.has(el.openingElement.name.name) || attr(el, "accessibilityLabel")) return
    // CustomTextInput says its placeholder; a control inside a labelled group is named by the group
    if (el.openingElement.name.name === "CustomTextInput" && attr(el, "placeholder")) return
    if (p.findParent((q) => q.isJSXElement() && attr(q.node, "accessibilityLabel"))) return
    found.push(where(el))
  })
  return found
}

module.exports = { unnamedPressables, unlabelledFields }
