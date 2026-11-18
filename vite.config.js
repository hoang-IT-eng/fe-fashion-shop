import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Server-side dev/preview middleware for /api/ai-chat.
 * Reads GEMINI_API_KEY (non-VITE_ prefix -> never bundled into browser JS) strictly on the Node server.
 */
function serverSideAiPlugin() {
  let apiKey = ''
  let model = 'gemini-2.5-flash'

  const mountMiddleware = middlewares => {
    middlewares.use('/api/ai-chat', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method Not Allowed' }))
        return
      }
      if (!apiKey) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ reply: null, engine: 'hybrid-rag-local' }))
        return
      }

      let raw = ''
      for await (const chunk of req) {
        raw += chunk
        if (raw.length > 32768) break
      }
      let body = {}
      try {
        body = JSON.parse(raw || '{}')
      } catch {
        body = {}
      }

      const message = String(body.message || '').trim().slice(0, 2000)
      const fallbackText = String(body.fallbackText || '').slice(0, 3000)
      const blockKinds = Array.isArray(body.blockKinds) ? body.blockKinds.slice(0, 8) : []

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
                text: `You are ENIGMA — an avant-garde luxury streetwear & grail auction stylist. Reply in the user's language (Vietnamese or English) in 1-2 crisp editorial sentences grounded strictly in: ${JSON.stringify({ fallbackText, blockKinds })}.\nUser message: ${message}`,
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
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply: text, engine: 'gemini-2.5-flash' }))
            return
          }
        } catch {
          // try fallback endpoint
        }
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ reply: null, engine: 'hybrid-rag-fallback' }))
    })
  }

  return {
    name: 'enigma-server-ai-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, process.cwd(), '')
      apiKey = (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim()
      model = (env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim()
    },
    configureServer(server) {
      mountMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      mountMiddleware(server.middlewares)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serverSideAiPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
