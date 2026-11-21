// payments.js
// The Gotovo fee of a task: the settings give three fees; the price picks one (up to 2000, up to 4000,
// above). null while the fees are not known.
export const feeFor = (price, fees) => {
  if (!Array.isArray(fees) || !fees.length) return null
  const sorted = fees.map((fee) => parseInt(fee)).sort((a, b) => a - b)
  if (price <= 2000) return sorted[0]
  if (price <= 4000) return sorted[1]
  return sorted[2]
}
