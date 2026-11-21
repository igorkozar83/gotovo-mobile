// TopPart.js
// The top of Home: the header, the slider, the S.O.S. offer (clients) and the categories; children
// follow (the search and filters).
import React from "react"
import { View, Text, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"

import Header from "../Header"
import HomeSlider from "./HomeSlider"
import CategoryScroller from "./CategoryScroller"
import FastImageComponent from "../media/FastImageComponent"
import useAuthStore from "../../stores/authStore"
import useUiStore from "../../stores/uiStore"
import { translate } from "../../Helpers/language.utils"

import styles from "../../styles/Home.style"
import { atoms } from "../../styles/atoms"

const SosOffer = () => {
  const navigation = useNavigation()
  return (
    <View style={{ ...styles.sosButton, alignItems: "center" }}>
      <View style={styles.sosButtonIn}>
        <Text style={styles.sosButtonInText}>{translate("topPart.ifYouNeedASimpleTask")}</Text>
      </View>
      <View style={{ ...styles.sosButtonIn, alignItems: "center" }}>
        <Pressable
          style={styles.sosButtonButton}
          onPress={() => {
            useUiStore.getState().setSelectedJobId(null)
            navigation.navigate("PostTask", { isSos: true })
          }}
        >
          <Text style={styles.sosButtonButtonText}>{translate("topPart.sosTasks")}</Text>
          <View>
            <FastImageComponent style={styles.buttonImage} source={require("../../assets/sosIcon.png")} />
          </View>
        </Pressable>
      </View>
    </View>
  )
}

const TopPart = ({ children }) => {
  const role = useAuthStore((state) => state.userSelect)
  return (
    <View style={atoms.zIndex20}>
      <Header />
      <View style={styles.mainContent}>
        <HomeSlider />
        {role === "CLIENT" ? <SosOffer /> : null}
        <View style={styles.categoriesSlider}>
          <CategoryScroller role={role} />
        </View>
      </View>
      {children}
    </View>
  )
}

export default TopPart
