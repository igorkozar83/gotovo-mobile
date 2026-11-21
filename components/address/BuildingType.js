// BuildingType.js
// Whether the address is a house or a building (in the role's color).
import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"

import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const Choice = ({ label, selected, onPress, style, radioStyle }) => {
  const colors = useRoleColors()
  return (
    <View style={[styles.typeRow, style]}>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: !!selected }} accessibilityLabel={translate(label)} onPress={onPress} style={[styles.radio, radioStyle]}>
        {selected && <View style={[styles.dot, { backgroundColor: colors.bgColor }]}></View>}
      </Pressable>
      <Text style={styles.label}>{translate(label)}</Text>
    </View>
  )
}

const BuildingType = ({ isHouse, onChange }) => (
  <View style={styles.row}>
    <Choice label={"buildingType.house"} selected={isHouse === true} onPress={() => onChange(true)} radioStyle={atoms.marginRight5} />
    <Choice label={"buildingType.building"} selected={isHouse === false} onPress={() => onChange(false)} style={styles.choice} radioStyle={atoms.marginRight5Percent} />
  </View>
)

const styles = StyleSheet.create({
  typeRow: { flexDirection: "row", alignItems: "center" },
  choice: { marginLeft: "auto", marginRight: "10%" },
  row: { flexDirection: "row", alignItems: "center", flexGrow: 1, width: "100%", position: "relative", marginVertical: 10 },
  radio: { backgroundColor: palette.gray200, width: 27.5, height: 27.5, alignItems: "center", justifyContent: "center", borderRadius: 28 },
  dot: { width: 13, height: 13, borderRadius: 13 },
  label: { fontFamily: "Montserrat_500Medium", fontSize: 16, marginLeft: 5 }
})

export default BuildingType
