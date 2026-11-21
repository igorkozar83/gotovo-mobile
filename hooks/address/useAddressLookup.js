// useAddressLookup.js
// The street address at a point on the map.
import useApiAction from "../useApiAction"
import { getAddress } from "../../Services/UsersAPI"

// run({ latitude, longitude }); onFound({ street, city, zip, coords }); onDone runs after either answer
export const useAddressLookup = ({ onFound, onDone } = {}) =>
  useApiAction(getAddress, {
    error: "useAddressLookup.retrievingAddressError",
    failed: "useAddressLookup.thereWasAnErrorWhileRetrieving",
    onSuccess: (resp, coords) => {
      onFound({ street: resp.street, city: resp.city, zip: resp.zip, coords: { latitude: coords.latitude, longitude: coords.longitude } })
      if (onDone) onDone()
    },
    onError: () => onDone && onDone()
  })
