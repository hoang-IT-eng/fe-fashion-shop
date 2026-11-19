export function formatVnd(amount: number | string | undefined | null): string {
  const num = Number(amount ?? 0)
  if (!Number.isFinite(num)) return '0₫'
  return `${Math.round(num).toLocaleString('vi-VN')}₫`
}

export function formatCountdown(remainingSeconds: number): string {
  const safe = Math.max(0, Math.floor(remainingSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export function secondsUntil(isoDate: string): number {
  const target = new Date(isoDate).getTime()
  if (Number.isNaN(target)) return 0
  return Math.max(0, Math.floor((target - Date.now()) / 1000))
}

/**
 * Display-only shim for the ENIGMA → NOCTURNE rename. Live API rows created
 * before the rename still carry the old brand in names/brands; this keeps the
 * storefront consistent until the backend seed data is updated.
 */
export function rebrand(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\bENIGMA\b/g, 'NOCTURNE')
    .replace(/\bEnigma\b/g, 'Nocturne')
    .replace(/\bREBORN\b/g, 'AFTERLIFE')
    .replace(/\bReborn\b/g, 'Afterlife')
}
