// useLiveChannels.js
import useLiveChannel from "../useLiveChannel"

// The user's app-wide socket channels (inbox count, modals opened by the other party, offers),
// active while a channel is known (the user is logged in).
// handlers: { onCountInbox(), onOpenModal(data), onRefreshOffers() }
const useLiveChannels = (channel, handlers) => {
  useLiveChannel(channel && "hotovo-refresh-count-inbox-" + channel, () => handlers.onCountInbox())
  useLiveChannel(channel && "hotovo-open-modal-" + channel, (payload) => handlers.onOpenModal(payload.message || payload))
  useLiveChannel(channel && "hotovo-refresh-offers-" + channel, () => handlers.onRefreshOffers())
}

export default useLiveChannels
