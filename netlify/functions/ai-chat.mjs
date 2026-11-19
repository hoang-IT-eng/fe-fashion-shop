import process from 'node:process'

/**
 * Server-Side NOCTURNE Grail Stylist Proxy (Netlify Serverless Function).
 * Reads GEMINI_API_KEY strictly from server environment variables — never exposed to browser or localStorage.
 */
export default async req => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) {
    return new Response(JSON.stringify({ reply: null, engine: 'hybrid-rag-local' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const message = String(body.message || '').trim().slice(0, 2000)
  const fallbackText = String(body.fallbackText || '').slice(0, 3000)
  const blockKinds = Array.isArray(body.blockKinds) ? body.blockKinds.slice(0, 8) : []

  if (!message) {
    return new Response(JSON.stringify({ error: 'Missing message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash'
  const encKey = encodeURIComponent(apiKey)
  const vertexUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${encKey}`
  const studioUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encKey}`
  const endpoints = apiKey.startsWith('AQ.') ? [vertexUrl, studioUrl] : [studioUrl, vertexUrl]

  const payload = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `You are NOCTURNE — an avant-garde luxury streetwear & grail auction stylist. Reply in the user's language (Vietnamese or English) in 1-2 crisp editorial sentences grounded strictly in: ${JSON.stringify({ fallbackText, blockKinds })}.\nUser message: ${message}`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.25, maxOutputTokens: 240 },
  })

  for (const url of endpoints) {
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(18000),
      })
      if (!upstream.ok) continue
      const data = await upstream.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (text) {
        return new Response(JSON.stringify({ reply: text, engine: model }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch {
      // try fallback endpoint
    }
  }

  return new Response(JSON.stringify({ reply: null, engine: 'hybrid-rag-fallback' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
