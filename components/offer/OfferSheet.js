// OfferSheet.js
// The orange modal of an offer: the icon and title, who it goes to and the task, then the form
// (children).
import React from "react"
import { ScrollView, StyleSheet } from "react-native"

import GradientModal from "../sheets/GradientModal"
import { SheetIcon, SheetTitle, Fact, SheetDivider } from "../sheets/SheetParts"

/**
 * clientName (+ clientNameStyle / clientNameProps), taskName: what the offer is about
 * closeStyle, outerStyle, avoidingStyle, scrollProps: the two modals' small layout differences
 */
const OfferSheet = ({
  visible,
  onClose,
  onRequestClose,
  icon,
  title,
  clientName,
  clientNameStyle,
  clientNameProps,
  taskName,
  closeStyle,
  outerStyle,
  avoidingStyle,
  scrollRef,
  scrollProps,
  children
}) => (
  <GradientModal visible={visible} onClose={onClose} onRequestClose={onRequestClose} closeStyle={closeStyle} outerStyle={outerStyle} avoidingStyle={avoidingStyle}>
    <ScrollView
      scrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ref={scrollRef}
      {...scrollProps}
    >
      <SheetIcon source={icon} />
      <SheetTitle>{title}</SheetTitle>
      <Fact label={"common.toClient"} textStyle={clientNameStyle} textProps={clientNameProps}>
        {clientName}
      </Fact>
      <Fact label={"common.taskName"}>{taskName}</Fact>
      <SheetDivider thick gap={10} />
      {children}
    </ScrollView>
  </GradientModal>
)

const styles = StyleSheet.create({
  content: { borderRadius: 20, overflow: "hidden", paddingBottom: 15, padding: 20 }
})

export default OfferSheet
