import { demoHandleRequest } from './enigmaDemoEngine'

const RAW_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')

function handleUnauthorized() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth'
  }
}

function isDemoToken(token: string | null): boolean {
  return Boolean(token && token.startsWith('enigma-demo-jwt:'))
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')
  const method = (options.method || 'GET').toUpperCase()
  const parsedBody =
    typeof options.body === 'string' && options.body.length > 0
      ? JSON.parse(options.body)
      : undefined

  const isAiEndpoint = path.startsWith('/ai-chat/')

  // If no live backend URL is configured (or demo session for non-public endpoints), use resilient demo engine directly
  if (!RAW_BASE_URL || (isDemoToken(token) && !isAiEndpoint)) {
    return demoHandleRequest<T>(method, path, parsedBody, token)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), isAiEndpoint ? 15000 : 3200)
    const forwardAuth = token && !isDemoToken(token)

    const res = await fetch(`${RAW_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(forwardAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)

    const data = await res.json().catch(() => ({}))

    if (res.status === 401) {
      handleUnauthorized()
      throw new Error('Session expired. Please sign in again.')
    }

    if (!res.ok) {
      const message = Array.isArray(data.message) ? data.message[0] : data.message
      throw new Error(message || 'Request failed')
    }

    return data as T
  } catch (err) {
    // Preserve explicit 4xx validation errors from live API, but fall back seamlessly on network/offline errors
    if (
      err instanceof Error &&
      !(err.name === 'AbortError' || err instanceof TypeError || /fetch|network|failed to fetch/i.test(err.message))
    ) {
      throw err
    }
    return demoHandleRequest<T>(method, path, parsedBody, token)
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: async (file: File): Promise<{ url: string; publicId: string }> => {
    const token = localStorage.getItem('accessToken')
    if (!RAW_BASE_URL || isDemoToken(token)) {
      const localUrl = URL.createObjectURL(file)
      return { url: localUrl, publicId: `enigma-local-${Date.now()}` }
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${RAW_BASE_URL}/products/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (res.status === 401) {
        handleUnauthorized()
        throw new Error('Session expired.')
      }
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      return data
    } catch {
      const localUrl = URL.createObjectURL(file)
      return { url: localUrl, publicId: `enigma-local-${Date.now()}` }
    }
  },
}
