// PlaceAutocomplete.js
// The street field with Google place suggestions (Serbia); picking one fills the form (onPlace gets the
// place's details). The suggestions are asked of our server (api/v2/maps), which asks Google with its own key:
// the app holds no key that works for anyone.
import React from "react"
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import Constants from "expo-constants"

import useUiStore from "../../stores/uiStore"
import { labelStyle } from "./AddressField"
import { translate } from "../../Helpers/language.utils"
import { palette } from "../../styles/palette"

const inputStyle = {
  height: Platform.OS === "ios" ? 44 : 40,
  backgroundColor: palette.gray100,
  padding: 10,
  width: 800,
  paddingLeft: 5,
  fontSize: 16,
  fontFamily: "Montserrat_500Medium",
  borderRadius: 0
}

// the server's mirror of Google's place paths (…/place/autocomplete/json, …/place/details/json)
const PLACES = { url: Constants.expoConfig.extra.API_URL + "v2/maps", useOnPlatform: "all" }

const PlaceAutocomplete = ({ value, onChangeText, onPlace }) => {
  const language = useUiStore((state) => state.language)
  return (
    <View style={styles.field}>
      <View style={styles.suggestionRow}>
        <Text style={labelStyle}>{translate("placeAutocomplete.address")} *</Text>
      </View>
      <ScrollView horizontal scrollEnabled={false} keyboardShouldPersistTaps={"handled"}>
        <GooglePlacesAutocomplete
          value={value}
          listViewDisplayed={false}
          onChangeText={onChangeText}
          styles={{ textInput: inputStyle }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          debounce={2000}
          keyboardShouldPersistTaps={"handled"}
          minLength={3}
          placeholder={value}
          onPress={(data, details = null) => onPlace(details)}
          requestUrl={PLACES}
          query={{ language: language ? language.toLowerCase() : "en", components: "country:rs" }}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  field: { position: "relative", marginVertical: 10 },
  suggestionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
})

export default PlaceAutocomplete
