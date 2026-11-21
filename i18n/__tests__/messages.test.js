// The catalog and the code agree: a text the code names in a translate() call is an id of the catalog, and every id
// of the catalog is named somewhere (none left behind when its text goes).
import fs from "fs"
import path from "path"

import messages from "../messages"

const ROOT = path.join(__dirname, "..", "..")
const DIRS = ["components", "screens", "hooks", "Helpers", "navigation", "stores", "Services"]

const sources = []
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__") walk(full)
    } else if (entry.name.endsWith(".js")) sources.push({ file: path.relative(ROOT, full), code: fs.readFileSync(full, "utf8") })
  })
DIRS.forEach((dir) => walk(path.join(ROOT, dir)))

const ID = /^[a-z][A-Za-z0-9]*\.[a-z][A-Za-z0-9]*$/

describe("i18n/messages", () => {
  it("every id is namespace.key, with its English", () => {
    Object.entries(messages).forEach(([id, text]) => {
      expect(id).toMatch(ID)
      expect(typeof text).toBe("string")
      expect(text.trim()).not.toBe("")
    })
  })

  it("a text named in translate() is a catalog id", () => {
    const unknown = []
    sources.forEach(({ file, code }) => {
      for (const m of code.matchAll(/\b(?:translate|translatedOrNull|spokenLabel)\(\s*"([^"]*)"/g)) if (!Object.hasOwn(messages, m[1])) unknown.push(`${file}: ${m[1]}`)
    })
    expect(unknown).toEqual([])
  })

  it("every id is used", () => {
    const code = sources.map((s) => s.code).join("\n")
    expect(Object.keys(messages).filter((id) => !code.includes(`"${id}"`))).toEqual([])
  })
})
