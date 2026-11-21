// NewMessageReceived.js
// A chat message arrived: the sender's photo and name, the message, and REPLY (opens the chat).
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

import GradientModal, { BLUE, ORANGE } from "../sheets/GradientModal"
import FastImageComponent from "../media/FastImageComponent"
import Button from "../ui/Button"
import { SheetDivider } from "../sheets/SheetParts"
import { palette } from "../../styles/palette"
import { atoms } from "../../styles/atoms"

/**
 * message: { image, name (the sender), title, text (the heading and the message), type (the user's role),
 *            userId, taskId (the chat REPLY opens) }
 */
const NewMessageReceived = ({ message, visible, onClose }) => {
  const navigation = useNavigation()
  const { image, title, text, type, name, userId, taskId } = message
  return (
    <GradientModal visible={visible} onClose={onClose} onRequestClose={onClose} colors={type === "TASKER" ? ORANGE : BLUE} closeStyle={styles.closeButton} keyboardAvoiding={false}>
      <View style={styles.body}>
        <View style={[styles.centered, atoms.marginTop30]}>
          <View style={styles.photoRing}>
            <FastImageComponent source={image} style={styles.photo} />
          </View>
        </View>
        <View style={[styles.centered, atoms.marginTop40]}>
          <Text style={[styles.white, atoms.fontSize20]}>{title}</Text>
          <Text style={[styles.white, atoms.fontSize18]}>{name}</Text>
        </View>
        <SheetDivider />
        <View style={[styles.centered, atoms.marginBottom20]}>
          <Text style={[styles.white, styles.message]}>{text}</Text>
        </View>
        <Button
          onPress={() => {
            navigation.navigate("Chat", { userId, taskId })
            onClose()
          }}
          background={palette.white}
          textColor={palette.blue}
          title={"common.reply"}
        >
          <MaterialCommunityIcons name="comment-outline" size={20} color={palette.blue} />
        </Button>
      </View>
    </GradientModal>
  )
}

const styles = StyleSheet.create({
  closeButton: { right: "5%", top: "5%" },
  body: { padding: 35, paddingTop: 0 },
  message: { fontSize: 16, textAlign: "left" },
  centered: { justifyContent: "center", alignItems: "center" },
  photoRing: { borderRadius: 120, width: 225, height: 225, justifyContent: "center", alignItems: "center", backgroundColor: palette.blueMuted },
  photo: { borderRadius: 100, width: 200, height: 200 },
  white: { fontFamily: "Montserrat_500Medium", color: palette.white, textAlign: "center" }
})

export default NewMessageReceived
