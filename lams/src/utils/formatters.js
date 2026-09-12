/* ============================================================
   Bharat Bhoomi Reusable Formatters & Utilities
   ============================================================ */

export const formatNumber = (num, decimals = 0) => {
  if (num == null) return '—'
  if (num >= 10000000) return (num / 10000000).toFixed(decimals) + 'Cr'
  if (num >= 100000) return (num / 100000).toFixed(decimals) + 'L'
  if (num >= 1000) return num.toLocaleString('en-IN')
  return num.toLocaleString('en-IN')
}

export const formatCurrency = (amount, currency = '₹', compact = true) => {
  if (amount == null) return '—'
  if (compact && amount >= 10000000) return currency + (amount / 10000000).toFixed(1) + ' Cr'
  if (compact && amount >= 1000) return currency + (amount / 1000).toFixed(1) + ' L'
  return currency + amount.toLocaleString('en-IN')
}

export const formatArea = (area, unit = 'ha') => {
  if (area == null) return '—'
  if (area >= 10000) return (area / 10000).toFixed(1) + ' km²'
  return area.toLocaleString('en-IN') + ' ' + unit
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateRange = (start, end) => {
  return formatDate(start) + ' – ' + formatDate(end)
}

export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toTitleCase = (str) => {
  if (!str) return ''
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const getStatusColor = (status) => {
  const map = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
    review: 'info',
    acquired: 'success',
    possession: 'teal',
    delayed: 'error',
    disputed: 'violet',
  }
  return map[status] || 'neutral'
}

export const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0
  return Math.min(Math.round((current / total) * 100), 100)
}

export const getRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return diffMins + ' min ago'
  if (diffHours < 24) return diffHours + ' hour ago'
  if (diffDays < 2) return '1 day ago'
  if (diffDays < 7) return diffDays + ' days ago'
  return formatDate(dateStr)
}

export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const downloadCSV = (data, filename = 'data.csv') => {
  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map((row) => Object.values(row).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
