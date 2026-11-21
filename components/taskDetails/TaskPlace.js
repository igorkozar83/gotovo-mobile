// TaskPlace.js
// Where the task is. Someone taking part in it sees the full address and a pin that opens the maps app;
// anyone else sees the street without its number and the map without a pin.
import React from "react"
import { View, Text, Linking, StyleSheet } from "react-native"
import MapView, { Marker } from "react-native-maps"

import TitleWithBorder from "../ui/TitleWithBorder"
import { approximateAddress, mapsUrl } from "../../Helpers/address"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const PlaceMap = ({ address, instructions, withPin }) => {
  const coordinate = { latitude: parseFloat(address.latitude), longitude: parseFloat(address.longitude) }
  const label = address.address + ", " + address.city
  return (
    <View style={atoms.marginBottom10}>
      <MapView style={styles.map} initialRegion={{ ...coordinate, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}>
        {withPin ? (
          <Marker onPress={() => Linking.openURL(mapsUrl(coordinate.latitude, address.longitude, label))} coordinate={coordinate} title={label} description={instructions} />
        ) : null}
      </MapView>
    </View>
  )
}

const TaskPlace = ({ task, takesPart }) => {
  const { address } = task
  return (
    <>
      <View style={atoms.marginBottom10}>
        <TitleWithBorder title={"taskPlace.place"} />
      </View>
      <View style={atoms.marginBottom10}>
        <Text style={styles.label}>{translate("taskPlace.address")}</Text>
        <Text style={styles.text}>{address ? (takesPart ? `${address.address}, ${address.city}` : `${address.city}, ${approximateAddress(address.address)}`) : "- - - "}</Text>
      </View>
      {!takesPart && (
        <View style={atoms.marginBottom10}>
          <Text style={styles.noteLabel}>{translate("common.note")}</Text>
          <Text style={styles.small}>{translate("taskPlace.thisIsAnApproximateLocationFull")}</Text>
        </View>
      )}
      {address && address.latitude && address.longitude ? <PlaceMap address={address} instructions={task.additional_instructions} withPin={takesPart} /> : null}
      {takesPart ? <Text style={[styles.small, atoms.marginBottom10]}>{translate("taskPlace.tapOnPinForNavigation")}</Text> : null}
      {task.additional_instructions ? (
        <View style={atoms.marginBottom40}>
          <Text style={styles.label}>{translate("taskPlace.additionalInstructions")}</Text>
          <Text style={styles.text}>{task.additional_instructions}</Text>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 10, fontFamily: "Montserrat_400Regular", color: palette.charcoal },
  noteLabel: { fontSize: 10, fontFamily: "Montserrat_600SemiBold", color: palette.charcoal },
  text: { fontSize: 16, fontFamily: "Montserrat_500Medium", color: palette.black },
  small: { fontSize: 12, fontFamily: "Montserrat_300Light", color: palette.black },
  map: { width: "100%", height: 230, borderRadius: 5, marginRight: 5 }
})

export default TaskPlace
