export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export const formatDate = (date) => {
  if (!date) return 'N/A'
  if (date instanceof Date) {
    return date.toLocaleString()
  }
  return new Date(Number(date) * 1000).toLocaleString()
}

