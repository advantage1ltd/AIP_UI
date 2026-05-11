/** Time parsing helpers for incident hour charts. */
/** Parse hour 0–23 from common time-of-incident strings (12h or 24h). */
const parseIncidentHour = (time?: string): number | null => {
  if (!time?.trim()) return null
  const s = time.trim()
  const ampm = s.match(/\b(am|pm)\b/i)
  const leading = s.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/)
  if (!leading) return null
  let h = parseInt(leading[1], 10)
  if (Number.isNaN(h)) return null
  if (ampm) {
    const isPm = ampm[1].toLowerCase() === 'pm'
    if (isPm && h < 12) h += 12
    if (!isPm && h === 12) h = 0
  }
  if (h < 0 || h > 23) return null
  return h
}
