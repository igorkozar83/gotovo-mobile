// useAddressForm.js
// The address modal's form: a new address, or an existing one to edit. Filled by hand, from a Google
// suggestion or from a pin on the map. A logged-in user's address is saved (then the user reloads); a
// guest's goes back to the caller (onGuestAddress). Either way the form is cleared and closed.
import { useEffect, useState } from "react"

import useAuthStore from "../../stores/authStore"
import useApiAction from "../useApiAction"
import useAlert from "../useAlert"
import { addUserAddress, editUserAddress } from "../../Services/UsersAPI"
import { requiredFieldsMessage } from "../../Helpers/apiErrors"
import { parseCoords, isLatitude, isLongitude, placeFromGoogle } from "../../Helpers/address"
import { failedRules } from "../../Helpers/validation"

const EMPTY = { id: null, name: "", address: "", city: "", zip: "", coords: "", info: "", isHouse: false }

const fromSaved = (saved) => ({
  id: saved.id,
  name: saved.place_name,
  address: saved.address,
  city: saved.city,
  zip: saved.zip,
  coords: saved.latitude + ", " + saved.longitude,
  info: saved.info,
  isHouse: !!saved.is_house
})

const useAddressForm = ({ dataAddress, open, close, reloadUser, onGuestAddress }) => {
  const loggedIn = useAuthStore((state) => state.user.loggedIn)
  const { showError } = useAlert()
  const [form, setForm] = useState(EMPTY)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

  useEffect(() => {
    if (dataAddress) setForm(fromSaved(dataAddress))
  }, [dataAddress, open])

  const done = () => {
    setForm(EMPTY)
    close()
  }

  const saved = () => {
    reloadUser()
    done()
  }
  const add = useApiAction(addUserAddress, {
    error: "useAddressForm.addNewAddressError",
    invalid: requiredFieldsMessage,
    failed: "useAddressForm.thereWasAnErrorWhileAdding",
    onSuccess: saved,
    onError: done
  })
  const edit = useApiAction(editUserAddress, {
    error: "useAddressForm.editAddressError",
    invalid: requiredFieldsMessage,
    failed: "useAddressForm.thereWasAnErrorWhileEditing",
    onSuccess: saved,
    onError: done
  })

  const submit = () => {
    const { latitude, longitude } = parseCoords(form.coords)
    const errors = failedRules([
      [!form.name, "useAddressForm.pleaseEnterValidName"],
      [!form.city, "useAddressForm.pleaseEnterValidCity"],
      [latitude && !isLatitude(latitude), "useAddressForm.pleaseEnterValidLatitudeRightFormat"],
      [longitude && !isLongitude(longitude), "useAddressForm.pleaseEnterValidLongitudeRightFormat"]
    ])
    if (errors) return showError("useAddressForm.addNewAddressError", errors)

    const data = { place_name: form.name, address: form.address, zip: form.zip, city: form.city, info: form.info, is_house: form.isHouse, latitude, longitude }
    if (form.id) return edit.run({ id: form.id, ...data })
    if (!loggedIn) {
      onGuestAddress(data)
      return done()
    }
    add.run(data)
  }

  return {
    form,
    set,
    // a pin placed on the map
    fromMap: ({ street, city, zip, coords }) => setForm((current) => ({ ...current, address: street, city, zip, coords: coords.latitude + ", " + coords.longitude })),
    // a Google suggestion: only the parts it has replace the form's
    fromGoogle: (details) => {
      const place = placeFromGoogle(details)
      setForm((current) => ({
        ...current,
        address: place.street || current.address,
        zip: place.zip || current.zip,
        city: place.city || current.city,
        coords: place.latitude && place.longitude ? place.latitude + ", " + place.longitude : current.coords
      }))
    },
    cancel: done,
    submit
  }
}

export default useAddressForm
