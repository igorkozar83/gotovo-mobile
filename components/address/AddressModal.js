// AddressModal.js
// Adding or editing a saved address (Profile, PostTask), or entering one as a guest (setAddress). A pin
// can be placed on the map instead of typing: the form closes while the map is open and comes back
// filled (setModalAddress reopens it).
import React, { useRef, useState } from "react"
import { StyleSheet, View, Text, ScrollView } from "react-native"
import { SimpleLineIcons, AntDesign } from "@expo/vector-icons"

import Button from "../ui/Button"
import MapModal from "./MapModal"
import AddressField from "./AddressField"
import BuildingType from "./BuildingType"
import PlaceAutocomplete from "./PlaceAutocomplete"
import useAddressForm from "../../hooks/address/useAddressForm"
import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import ModalFrame, { CloseX } from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const AddressModal = ({ reloadUser, onVisibleChange, visible, onClose, address, onGuestAddress }) => {
  const colors = useRoleColors()
  const scroll = useRef(null)
  const [mapOpen, setMapOpen] = useState(false)
  const { form, set, fromMap, fromGoogle, cancel, submit } = useAddressForm({
    dataAddress: address,
    open: visible,
    close: onClose,
    reloadUser: () => reloadUser(),
    onGuestAddress: (address) => onGuestAddress(address)
  })
  const scrollToEnd = () => scroll.current && scroll.current.scrollToEnd({ animated: true })

  return (
    <>
      {/* (the system back button closes it as the X does, the form cleared: only the map keeps it while open) */}
      <ModalFrame visible={visible} onRequestClose={cancel} cardStyle={styles.card} keyboardAvoiding dismissKeyboardOnTap>
        <View style={[styles.modalIn, atoms.overflowHidden]}>
          <CloseX onPress={cancel} size={27} color={colors.textColor} style={styles.closeBtn} />
          <ScrollView
            horizontal={false}
            ref={scroll}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps={"handled"}
          >
            <View style={atoms.padding25}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.bgColor }]}>
                {translate("addressModal.enterAddress")}
              </Text>
              <AddressField
                label={"addressModal.placeName"}
                style={styles.field}
                inputStyle={{ fontSize: form.name ? 16 : 13, includeFontPadding: false, textAlignVertical: "center" }}
                placeholderTextColor={palette.gray400}
                placeholder={translate("addressModal.myHomeOfficeParentsHomeEtc")}
                value={form.name}
                onChangeText={set("name")}
              />
              <PlaceAutocomplete value={form.address} onChangeText={set("address")} onPlace={fromGoogle} />
              <AddressField label={"addressModal.city"} required value={form.city} onChangeText={set("city")} onFocus={scrollToEnd} />
              <AddressField label={"addressModal.zip"} style={atoms.marginVertical10} value={form.zip} onChangeText={set("zip")} onFocus={scrollToEnd} />
              <BuildingType isHouse={form.isHouse} onChange={set("isHouse")} />
              <View style={atoms.marginVertical10}>
                <Button
                  onPress={() => {
                    onClose()
                    setMapOpen(true)
                  }}
                  title={"addressModal.placePinOnMap"}
                  background={palette.gray600}
                >
                  <SimpleLineIcons name="location-pin" size={20} color={palette.white} />
                </Button>
              </View>
              <Button title={"common.ok"} onPress={submit}>
                <AntDesign name="check" size={20} color={palette.white} />
              </Button>
            </View>
          </ScrollView>
        </View>
      </ModalFrame>
      <MapModal
        visible={mapOpen}
        onClose={() => {
          setMapOpen(false)
          onVisibleChange(true)
        }}
        onAddress={fromMap}
      />
    </>
  )
}

const styles = StyleSheet.create({
  field: { position: "relative", marginVertical: 10 },
  card: { marginVertical: 20, overflow: "hidden" },
  modalIn: { width: "100%", borderRadius: 0, paddingBottom: 20 },
  content: { borderRadius: 20, overflow: "hidden" },
  closeBtn: { zIndex: 50, width: 30, height: 30, right: 3, top: 10 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 24, textAlign: "center", marginTop: 30, marginBottom: 0 }
})

export default AddressModal
