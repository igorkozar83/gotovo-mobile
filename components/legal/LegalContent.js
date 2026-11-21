// LegalContent.js
// The text of a legal page (the terms, the privacy policy, the FAQ): headings, paragraphs with their bold
// parts, and numbered or bulleted items. The texts come with the app (assets/legal/*.json, made from the
// documents the client sent; in Serbian only).
import React from "react"
import { View, Text, StyleSheet } from "react-native"

import { palette } from "../../styles/palette"

export const LEGAL_PAGES = {
  terms: { title: "Terms & Conditions", blocks: require("../../assets/legal/terms.json") },
  privacy: { title: "Privacy Policy", blocks: require("../../assets/legal/privacy.json") },
  faq: { title: "Frequently Asked Questions", blocks: require("../../assets/legal/faq.json") }
}

const Spans = ({ spans, style }) => (
  <Text style={style}>
    {spans.map(([text, bold], i) => (
      <Text key={i} style={bold ? styles.bold : null}>
        {text}
      </Text>
    ))}
  </Text>
)

// page: "terms", "privacy" or "faq"
const LegalContent = ({ page }) => (
  <View style={styles.body}>
    {LEGAL_PAGES[page].blocks.map((block, i) => {
      if (block.t === "h") {
        return (
          <Text key={i} accessibilityRole="header" style={styles.heading}>
            {block.text}
          </Text>
        )
      }
      if (block.t === "li") {
        return (
          <View key={i} style={[styles.item, { paddingLeft: 12 * block.level }]}>
            <Text style={[styles.text, styles.marker]}>{block.marker}</Text>
            <Spans spans={block.spans} style={[styles.text, styles.itemText]} />
          </View>
        )
      }
      return <Spans key={i} spans={block.spans} style={[styles.text, styles.paragraph]} />
    })}
  </View>
)

const styles = StyleSheet.create({
  body: { marginHorizontal: 22, marginTop: 24 },
  heading: { fontSize: 17, fontFamily: "Montserrat_600SemiBold", color: palette.black, marginTop: 14, marginBottom: 10 },
  text: { fontSize: 14, lineHeight: 21, fontFamily: "Montserrat_400Regular", color: palette.black },
  bold: { fontFamily: "Montserrat_600SemiBold" },
  paragraph: { marginBottom: 12 },
  item: { flexDirection: "row", marginBottom: 8 },
  marker: { minWidth: 30, paddingRight: 6 },
  itemText: { flex: 1 }
})

export default LegalContent
