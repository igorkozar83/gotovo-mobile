// HomeClientCategoriesList.js
// The client's Home: the top (slider, S.O.S., categories) with the search, then the services of the
// chosen category. A service starts posting a task of it.
import React from "react"
import { View, Text, Pressable, TextInput, StyleSheet, Platform, KeyboardAvoidingView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import { Ionicons } from "@expo/vector-icons"

import TopPart from "./TopPart"
import FastImageComponent from "../media/FastImageComponent"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Home.style"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

const Service = ({ service, onPress }) => (
  <Pressable onPress={onPress}>
    <View style={atoms.marginBottom10}>
      <FastImageComponent source={{ uri: service.image }} style={local.image} transition={1000} />
      <View style={local.texts}>
        <Text style={[local.text, atoms.fontFamilyMontserrat600SemiBold]}>{translate(service.blackText)}</Text>
        <Text style={[local.text, atoms.fontFamilyMontserrat300Light]}>{translate(service.additionalText)}</Text>
      </View>
    </View>
  </Pressable>
)

/**
 * services: those shown; search / onSearch: the typed text; found: how many a search matched (0 without one)
 * fetching: fades the list; extraData: what else re-renders it (language)
 */
const HomeClientCategoriesList = ({ services, search, onSearch, found, fetching, extraData }) => {
  const navigation = useNavigation()

  const openService = (service) => {
    const ui = useUiStore.getState()
    ui.setSelectedCat(service.categoryId)
    ui.setSelectedJobId(service.tasks && service.tasks.length ? service.tasks[0].id : null)
    navigation.navigate("PostTask")
  }

  return (
    <View style={atoms.flex1}>
      <KeyboardAvoidingView style={[local.screen, fetching && { opacity: 0.3 }]} behavior={Platform.OS === "ios" ? "padding" : null}>
        <FlashList
          contentContainerStyle={atoms.paddingBottom60}
          bounces={false}
          data={services}
          estimatedItemSize={100}
          ListHeaderComponent={
            <View style={local.header}>
              <TopPart>
                <View style={local.searchBar}>
                  <View style={styles.inputSearch}>
                    <TextInput
                      accessibilityLabel={translate("homeClientCategoriesList.findAProject")}
                      value={search}
                      onChangeText={onSearch}
                      style={[local.input, search ? local.valued : null]}
                      placeholder={translate("homeClientCategoriesList.findAProject") + "..."}
                    />
                    <Ionicons style={styles.inputIcon} name="search-outline" size={16} color={palette.gray600} />
                    {found ? (
                      <Text style={local.searchInput}>
                        {translate("homeClientCategoriesList.found")} <Text style={atoms.fontWeight700}>{found}</Text> {translate("homeClientCategoriesList.matchingResults")}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TopPart>
            </View>
          }
          keyExtractor={(item) => item.id.toString()}
          extraData={extraData}
          renderItem={({ item }) => <Service service={item} onPress={() => openService(item)} />}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const local = StyleSheet.create({
  screen: { flex: 1, width: "100%" },
  searchBar: { zIndex: 5, backgroundColor: palette.white },
  searchInput: { paddingLeft: 10, color: palette.gray600 },
  header: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    zIndex: 4,
    backgroundColor: palette.white,
    flex: 1,
    marginBottom: 10
  },
  input: { minHeight: 40, paddingLeft: 30, fontSize: 18, fontFamily: "Montserrat_400Regular", textAlignVertical: "center" },
  valued: { color: palette.blueDark },
  image: { width: "100%", aspectRatio: 2.98 },
  texts: { position: "absolute", marginTop: 20, marginLeft: 25 },
  text: { fontSize: 22 }
})

export default HomeClientCategoriesList
