/**
 * @jest-environment node
 */
const path = require("path")

const { unnamedPressables, unlabelledFields } = require("../../testUtils/accessibility")

describe("accessibility", () => {
  it("every button a screen reader can reach has a name", () => {
    expect(unnamedPressables(path.join(__dirname, "..", ".."))).toEqual([])
  })

  it("every field and checkbox / radio says what it is for", () => {
    expect(unlabelledFields(path.join(__dirname, "..", ".."))).toEqual([])
  })
})
