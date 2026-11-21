// propContracts.js
// Checks the props between components and their callers (components/ and screens/): a prop a caller passes
// that the component never reads (a renamed or dropped prop, so the value is lost), and a prop a component
// reads that no caller passes. Only components whose props are destructured without ...rest are checked.
const fs = require("fs")
const path = require("path")
const parser = require("@babel/parser")
const traverse = require("@babel/traverse").default

const checkPropContracts = (root) => {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(p)
      return e.name.endsWith(".js") ? [p] : []
    })
  const files = [...walk(path.join(root, "components")), ...walk(path.join(root, "screens"))]
  const parse = (file) => parser.parse(fs.readFileSync(file, "utf8"), { sourceType: "module", plugins: ["jsx"] })
  const rel = (f) => path.relative(root, f).split(path.sep).join("/")

  // file -> { exportedName/localName -> { props:Set, rest:boolean } }
  const defs = {}
  for (const file of files) {
    const ast = parse(file)
    const local = {}
    const record = (name, fn) => {
      const param = fn.params[0]
      if (!param) return (local[name] = { props: new Set(), rest: false, none: true })
      if (param.type !== "ObjectPattern") return
      const props = new Set()
      let rest = false
      for (const p of param.properties) {
        if (p.type === "RestElement") rest = true
        else if (p.key && p.key.type === "Identifier") props.add(p.key.name)
      }
      local[name] = { props, rest }
    }
    traverse(ast, {
      VariableDeclarator(p) {
        const init = p.node.init
        if (p.node.id.type === "Identifier" && /^[A-Z]/.test(p.node.id.name) && init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression"))
          record(p.node.id.name, init)
      },
      FunctionDeclaration(p) {
        if (p.node.id && /^[A-Z]/.test(p.node.id.name)) record(p.node.id.name, p.node)
      }
    })
    let defaultName = null
    traverse(ast, {
      ExportDefaultDeclaration(p) {
        const d = p.node.declaration
        if (d.type === "Identifier") defaultName = d.name
        else if (d.type === "FunctionDeclaration" && d.id) defaultName = d.id.name
      }
    })
    defs[rel(file)] = { local, defaultName }
  }

  const resolveImport = (from, spec) => {
    if (!spec.startsWith(".")) return null
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec))
    for (const ext of ["", ".js", "/index.js"]) if (defs[base + ext]) return base + ext
    return null
  }

  const unread = []
  const unpassed = []
  const passed = {} // "file#Name" -> Set of attrs passed anywhere
  for (const file of files) {
    const r = rel(file)
    const ast = parse(file)
    // local name -> { file, name }
    const bindings = {}
    for (const name of Object.keys(defs[r].local)) bindings[name] = { file: r, name }
    traverse(ast, {
      ImportDeclaration(p) {
        const target = resolveImport(r, p.node.source.value)
        if (!target) return
        for (const s of p.node.specifiers) {
          if (s.type === "ImportDefaultSpecifier") bindings[s.local.name] = { file: target, name: defs[target].defaultName }
          else if (s.type === "ImportSpecifier") bindings[s.local.name] = { file: target, name: s.imported.name }
        }
      }
    })
    traverse(ast, {
      JSXOpeningElement(p) {
        const n = p.node.name
        if (n.type !== "JSXIdentifier") return
        const b = bindings[n.name]
        if (!b || !b.name) return
        const def = defs[b.file].local[b.name]
        if (!def) return
        const key = b.file + "#" + b.name
        passed[key] = passed[key] || new Set()
        let spread = false
        for (const attr of p.node.attributes) {
          if (attr.type === "JSXSpreadAttribute") {
            spread = true
            continue
          }
          const a = attr.name.name
          passed[key].add(a)
          if (def.rest || a === "key" || a === "ref") continue
          if (!def.props.has(a)) unread.push(`${r}:${p.node.loc.start.line} <${n.name}> passes "${a}", which ${b.file} never reads`)
        }
        if (spread) passed[key].add("...")
      }
    })
  }
  for (const [file, { local }] of Object.entries(defs)) {
    for (const [name, def] of Object.entries(local)) {
      const key = file + "#" + name
      if (!passed[key] || passed[key].has("...") || def.rest) continue
      for (const prop of def.props) if (prop !== "children" && !passed[key].has(prop)) unpassed.push(`${file} <${name}> reads "${prop}", which no caller passes`)
    }
  }
  return { unread, unpassed }
}

module.exports = { checkPropContracts }
