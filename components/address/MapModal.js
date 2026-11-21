// MapModal.js
// Picking an address on the map: a tap sets the marker, OK looks up the address there and fills the
// address form with it. The map closes after the lookup, whatever its answer.
import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import { AntDesign } from "@expo/vector-icons"

import Button from "../ui/Button"
import useRoleColors from "../../hooks/useRoleColors"
import { translate } from "../../Helpers/language.utils"
import { useAddressLookup } from "../../hooks/address/useAddressLookup"
import ModalFrame, { CloseX } from "../sheets/ModalFrame"
import { palette } from "../../styles/palette"

// Belgrade
const START = { latitude: 44.787197, longitude: 20.457273, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }

// onAddress({ street, city, zip, coords }): fills the address form
const MapModal = ({ onAddress, visible, onClose }) => {
  const colors = useRoleColors()
  const [marker, setMarker] = useState({ latitude: 0, longitude: 0 })

  const lookup = useAddressLookup({ onFound: onAddress, onDone: onClose })

  return (
    <ModalFrame visible={visible} onRequestClose={onClose} backdropStyle={styles.backdrop} cardStyle={styles.card}>
      <View style={styles.modalIn}>
        <CloseX onPress={onClose} color={colors.textColor} style={styles.closeBtn} />
        <View style={{ ...StyleSheet.absoluteFillObject, top: 0, justifyContent: "flex-end", alignItems: "center", borderRadius: 20 }}>
          <MapView style={styles.map} initialRegion={START} onPress={(e) => setMarker(e.nativeEvent.coordinate)}>
            {marker.latitude && marker.longitude ? <Marker coordinate={marker} title={"Choose your adress."} description={translate("mapModal.clickOnMapToSetAddress")} /> : null}
          </MapView>
        </View>
        <View style={styles.okButton}>
          <Button onPress={() => lookup.run({ longitude: marker.longitude, latitude: marker.latitude })} title={"common.ok"}>
            <AntDesign name="check" size={20} color={palette.white} />
          </Button>
        </View>
      </View>
    </ModalFrame>
  )
}

const styles = StyleSheet.create({
  okButton: { marginTop: "auto", paddingHorizontal: 20, zIndex: 20 },
  backdrop: { zIndex: 99999 },
  map: { ...StyleSheet.absoluteFillObject, borderRadius: 20 },
  card: { height: "80%", overflow: "hidden" },
  modalIn: { width: "100%", borderRadius: 0, paddingBottom: 20, height: "100%", position: "relative" },
  closeBtn: { right: "3%", top: "3%", zIndex: 3 }
})

export default MapModal
