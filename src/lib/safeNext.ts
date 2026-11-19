/** Only allow same-origin, path-only redirect targets. */
export function safeNext(raw: string | null): string | null {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.startsWith('/auth')) return decoded
  } catch {
    // ignore malformed values
  }
  return null
}
