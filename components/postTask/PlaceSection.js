// PlaceSection.js
// Where the task is: a logged-in user picks one of their saved addresses (or adds one to their address
// book); a guest enters the address their new account will have. Either sees the chosen address in full.
import React, { useState } from "react"
import { View, Text, Pressable, TouchableWithoutFeedback, StyleSheet } from "react-native"
import { useWatch } from "react-hook-form"
import { useNavigation } from "@react-navigation/native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import TitleWithBorder from "../ui/TitleWithBorder"
import PostTaskDropDown from "./PostTaskDropDown"
import Button from "../ui/Button"
import AddressModal from "../address/AddressModal"
import PostTaskTip from "./PostTaskTip"
import useAuthStore from "../../stores/authStore"
import useReloadUser from "../../hooks/useReloadUser"
import { translate } from "../../Helpers/language.utils"
import postTaskStyles from "../../styles/PostTask.style"
import { palette } from "../../styles/palette"
import { spokenLabel } from "../../Helpers/accessibility"

const MAX_ADDRESSES = 6

const NewAddressButton = ({ title, onPress }) => (
  <Button onPress={onPress} title={title} background={palette.gray600}>
    <MaterialCommunityIcons name="map-marker-plus-outline" size={20} color={palette.white} />
  </Button>
)

// the chosen address as the user reads it: street, then post code and city
const AddressLines = ({ address }) => (
  <View style={styles.savedAddress}>
    <Text style={styles.savedAddressLabel}>{translate("placeSection.savedAddress")}</Text>
    <Text style={styles.savedLine}>{address.address}</Text>
    <Text style={styles.savedLine}>
      {address.zip ? address.zip + " " : ""}
      {address.city}
    </Text>
  </View>
)

export const SavedPlace = ({ control, setValue }) => {
  const navigation = useNavigation()
  const addresses = useAuthStore((state) => state.user.userData?.addresses)
  const address = useWatch({ control, name: "address" })
  const reloadUser = useReloadUser()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <View style={styles.title}>
        <TitleWithBorder title={"placeSection.place"}>
          <PostTaskTip textKey="Tooltip 2 (place - POST A TASK)" />
        </TitleWithBorder>
      </View>
      {/* the dropdown closes when its `close` value changes: here, once an address is chosen */}
      <PostTaskDropDown silver={true} title={address.place_name} close={address.id}>
        {(addresses || [])
          .filter((saved) => saved.id !== address.id)
          .map((saved) => (
            <Pressable key={`dropdown-tasks-list${saved.id}`} onPress={() => setValue("address", saved)}>
              <Text style={styles.addressOption}>{saved.place_name}</Text>
            </Pressable>
          ))}
      </PostTaskDropDown>
      {address.id ? <AddressLines address={address} /> : null}
      {addresses?.length < MAX_ADDRESSES ? (
        <>
          <View style={styles.flat}>
            <Text style={[postTaskStyles.label, styles.raisedLabel, !address.id && { top: -8 }]}>{translate("placeSection.or")}</Text>
          </View>
          <View style={styles.fields}>
            <NewAddressButton title={translate("placeSection.newAddress")} onPress={() => setAdding(true)} />
            <View style={styles.fieldGap}>
              <Text style={styles.note}>
                {translate("placeSection.noteYouCanManageYourAddressBookIn")}{" "}
                <TouchableWithoutFeedback onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.noteLink}>{translate("placeSection.yourProfile")}</Text>
                </TouchableWithoutFeedback>
                .
              </Text>
            </View>
          </View>
        </>
      ) : null}
      <AddressModal onVisibleChange={setAdding} visible={adding} onClose={() => setAdding(false)} reloadUser={reloadUser} address={null} />
    </>
  )
}

export const GuestPlace = ({ control, setValue }) => {
  const newAddress = useWatch({ control, name: "newAddress" })
  const [adding, setAdding] = useState(false)

  return (
    <>
      <View style={styles.title}>
        <TitleWithBorder title={"placeSection.place"} />
      </View>
      {newAddress ? (
        <>
          <View style={styles.placeName} accessibilityLabel={spokenLabel("placeSection.place")}>
            <Text style={styles.placeNameText}>{newAddress.place_name}</Text>
          </View>
          <AddressLines address={newAddress} />
        </>
      ) : null}
      <View style={[styles.fields, newAddress && styles.fieldGap]}>
        <NewAddressButton title={!newAddress ? translate("placeSection.newAddress") : translate("placeSection.changeAddress")} onPress={() => setAdding(true)} />
        <View style={styles.fieldGap}>
          {/* (no link: the profile is there only once the account is made) */}
          <Text style={styles.note}>{translate("placeSection.noteGuestAddressBook")}</Text>
        </View>
      </View>
      <AddressModal onVisibleChange={setAdding} visible={adding} onClose={() => setAdding(false)} address={null} onGuestAddress={(address) => setValue("newAddress", address)} />
    </>
  )
}

const styles = StyleSheet.create({
  flat: { marginTop: 0, marginBottom: 0 },
  raisedLabel: { position: "relative", top: -12 },
  fields: { marginHorizontal: 22, position: "relative" },
  fieldGap: { marginTop: 10, marginBottom: 0 },
  title: { paddingHorizontal: 22, marginTop: 32, marginBottom: 20 },
  savedAddress: { marginHorizontal: 22, position: "relative", marginTop: 10, marginBottom: 0 },
  // a guest's place name, as the logged-in user's silver address box shows it
  placeName: { marginHorizontal: 22, backgroundColor: palette.gray350, paddingVertical: 14, paddingHorizontal: 15 },
  placeNameText: { color: palette.black, fontSize: 16, fontFamily: "Montserrat_400Regular" },
  savedAddressLabel: { color: palette.black, marginBottom: 5, fontSize: 12, fontFamily: "Montserrat_400Regular" },
  addressOption: { color: palette.black, lineHeight: 18, marginVertical: 3, textTransform: "uppercase", fontSize: 16, fontFamily: "Montserrat_500Medium", paddingLeft: 10 },
  savedLine: { color: palette.gray600, fontSize: 14, fontFamily: "Montserrat_600SemiBold" },
  note: { color: palette.black, fontSize: 10, fontFamily: "Montserrat_300Light" },
  noteLink: { color: palette.blueDark, fontFamily: "Montserrat_700Bold", fontSize: 10 }
})
