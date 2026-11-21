// JobsFilterBar.js
// The tasker's search box and the sort / task type menus above the open tasks. The menus close when
// Home loses focus or a search is submitted.
import React, { useLayoutEffect, useState } from "react"
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native"
import { useIsFocused } from "@react-navigation/native"
import { AntDesign, Ionicons } from "@expo/vector-icons"

import DropdownMenu from "../ui/DropdownMenu"
import useWindowLayout from "../../hooks/useWindowLayout"
import { translate } from "../../Helpers/language.utils"

import homeStyles from "../../styles/Home.style"
import { palette } from "../../styles/palette"

const SORTS = [
  { value: "newest", label: "jobsFilterBar.newest" },
  { value: "oldest", label: "jobsFilterBar.oldest" }
]
const TYPES = [
  { value: null, label: "jobsFilterBar.all" },
  { value: "regular", label: "jobsFilterBar.regular" },
  { value: "sos", label: "jobsFilterBar.sOS" }
]

const typeLabel = (type) => (!type ? translate("jobsFilterBar.all") + " " : type === "sos" ? translate("jobsFilterBar.sOS2") : translate("jobsFilterBar.regular"))

/**
 * search / onSearchChange / onSearchSubmit: the typed search, submitted when editing ends
 * sort / onSort: "newest" or "oldest"; type / onType: null (all), "regular" or "sos"
 */
const JobsFilterBar = ({ search, onSearchChange, onSearchSubmit, sort, onSort, type, onType }) => {
  const isFocused = useIsFocused()
  // "sort", "type" or null
  const [menu, setMenu] = useState(null)
  const [sortLayout, onSortLayout, measureSort] = useWindowLayout()
  const [typeLayout, onTypeLayout, measureType] = useWindowLayout()

  useLayoutEffect(() => {
    if (!isFocused) setMenu(null)
  }, [isFocused])

  const toggle = (name) => setMenu((open) => (open === name ? null : name))
  const close = () => setMenu(null)

  return (
    <View>
      <View style={homeStyles.inputSearch}>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          style={[styles.input, search ? styles.valued : null]}
          placeholder={translate("jobsFilterBar.findAProject") + "..."}
          accessibilityLabel={translate("jobsFilterBar.findAProject")}
          onEndEditing={() => {
            close()
            onSearchSubmit()
          }}
        />
        <Ionicons style={homeStyles.inputIcon} name="search-outline" size={16} color={palette.gray600} />
      </View>

      {/* two groups, each a label with its value and arrow right beside it; on a narrow phone the second
          goes under the first rather than off the screen */}
      <View style={styles.bar}>
        <View style={styles.inline}>
          <Text style={[styles.label, styles.filterText]}>{translate("jobsFilterBar.sortBy")}</Text>
          <View onLayout={onSortLayout}>
            <Pressable style={styles.inline} onPress={() => measureSort(() => toggle("sort"))}>
              <Text style={[styles.value, styles.sortText]}>{!sort ? "Date" : sort === "newest" ? translate("jobsFilterBar.newest") : translate("jobsFilterBar.oldest")}</Text>
              <AntDesign name="down" size={14} color={palette.gray600} />
            </Pressable>
          </View>
        </View>

        <View style={styles.inline}>
          <Text style={[styles.label, styles.filterText]}>{translate("jobsFilterBar.taskType")}</Text>
          <View onLayout={onTypeLayout}>
            <Pressable style={styles.inline} onPress={() => measureType(() => toggle("type"))}>
              <Text style={[styles.value, styles.sortText]}>{typeLabel(type).trim()}</Text>
              <AntDesign name="down" size={14} color={palette.gray600} />
            </Pressable>
          </View>
        </View>
      </View>

      <DropdownMenu
        visible={menu === "sort"}
        onClose={close}
        position={{ left: sortLayout.x, top: sortLayout.y + sortLayout.height }}
        options={SORTS}
        selected={sort}
        onSelect={onSort}
      />
      <DropdownMenu visible={menu === "type"} onClose={close} position={{ right: 20, top: typeLayout.y + typeLayout.height }} options={TYPES} selected={type} onSelect={onType} />
    </View>
  )
}

const styles = StyleSheet.create({
  filterText: { fontSize: 12, marginRight: 6 },
  sortText: { marginRight: 4, fontSize: 13 },
  input: { minHeight: 40, marginBottom: 10, paddingLeft: 30, paddingTop: 0, fontSize: 16, marginTop: 8, fontFamily: "Montserrat_400Regular" },
  valued: { color: palette.blueDark },
  bar: { flexDirection: "row", flexWrap: "wrap", rowGap: 6, columnGap: 16, paddingVertical: 5, paddingHorizontal: 20, justifyContent: "space-between" },
  inline: { flexDirection: "row", alignItems: "center" },
  label: { fontFamily: "Montserrat_700Bold", color: palette.gray600 },
  value: { color: palette.gray600, fontFamily: "Montserrat_400Regular" }
})

export default JobsFilterBar
