const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    throw new Error(message || 'Có lỗi xảy ra')
  }

  return data
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  // Upload ảnh — KHÔNG set Content-Type, browser tự xử lý multipart
  upload: async (file: File): Promise<{ url: string; publicId: string }> => {
    const token = localStorage.getItem('accessToken')
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${BASE_URL}/products/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Upload thất bại')
    return data
  },
}
