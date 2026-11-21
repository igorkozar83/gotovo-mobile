/**
 * @jest-environment node
 */
const path = require("path")

const { checkPropContracts } = require("../../testUtils/propContracts")

const root = path.join(__dirname, "..", "..")
const { unread, unpassed } = checkPropContracts(root)

describe("props between components and their callers", () => {
  it("every prop a caller passes is read by the component", () => {
    expect(unread).toEqual([])
  })

  it("every prop a component reads is passed somewhere (testID only by the tests)", () => {
    expect(unpassed).toEqual(['components/ui/ChoiceControls.js <ToggleBox> reads "testID", which no caller passes'])
  })
})
