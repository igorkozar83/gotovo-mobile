// AddressBookSection.js
// The user's saved addresses (up to 6): edit or remove each, add a new one.
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { SimpleLineIcons, MaterialCommunityIcons } from "@expo/vector-icons"

import SectionTitle from "./SectionTitle"
import Button from "../ui/Button"
import { RemoveButton, EditButton } from "../ui/RoundIconButton"
import useAuthStore from "../../stores/authStore"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const MAX_ADDRESSES = 6

const AddressBookSection = ({ onAdd, onEdit, onRemove }) => {
  const addresses = useAuthStore((state) => state.user.userData?.addresses)

  return (
    <>
      <SectionTitle title={"ADDRESS BOOK"} tip={"Tooltip 3 adress book (profile)"} />
      <View style={atoms.marginVertical20}>
        {(addresses || []).map((address) => (
          <View key={`info-addresses-list-${address.id}`} style={styles.row}>
            <SimpleLineIcons name="location-pin" size={24} color={palette.black} />
            <Text style={styles.placeName}>{address.place_name}</Text>
            <View style={styles.actions}>
              <RemoveButton onPress={() => onRemove(address.id)} />
              <EditButton onPress={() => onEdit(address)} />
            </View>
          </View>
        ))}
      </View>
      {addresses?.length < MAX_ADDRESSES ? (
        <View style={styles.list}>
          <Button onPress={onAdd} title={"addressBookSection.newAddress"} background={palette.gray600}>
            <MaterialCommunityIcons name="map-marker-plus-outline" size={20} color={palette.white} />
          </Button>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", marginLeft: "auto" },
  list: { width: "100%", marginBottom: 30 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  placeName: { fontSize: 20, fontFamily: "Montserrat_600SemiBold", marginLeft: 5, marginRight: "auto" }
})

export default AddressBookSection
