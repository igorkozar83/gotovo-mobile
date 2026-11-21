// roleColors.js
// The app's colors for the role it is used in: client blue, tasker orange.
import { palette } from "../styles/palette"

export const roleColors = (userSelect) => ({
  textColor: userSelect === "CLIENT" ? palette.blue : palette.orange,
  bgColor: userSelect === "CLIENT" ? palette.blueDark : palette.orange,
  tableLightBg: userSelect === "CLIENT" ? palette.blueTableLight : palette.orangePale,
  tableDarkerBg: userSelect === "CLIENT" ? palette.blueTableDark : palette.orangeLight,
  // tooltips and question marks
  accent: userSelect === "CLIENT" ? palette.blue : palette.orange,
  // the gradient of the role's form modals, and the text of their white buttons
  gradient: userSelect === "CLIENT" ? [palette.blueDark, palette.blue] : [palette.orangeDark, palette.orange],
  onWhite: userSelect === "CLIENT" ? palette.blueDark : palette.orangeDark
})
