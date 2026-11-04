// Local dev server mirroring the Vercel layout: public/ is static, api/*.js are the functions.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { cow, kamino, decimals } from './api/_relay.js'

const PORT = Number(process.env.PORT || 5178)
const here = dirname(fileURLToPath(import.meta.url))
const routes = { '/api/cow': cow, '/api/kamino': kamino, '/api/decimals': decimals }

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const handler = routes[url.pathname]
  if (handler) {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const request = new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined })
    const response = await handler(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    res.end(Buffer.from(await response.arrayBuffer()))
    return
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(await readFile(join(here, 'public/index.html')))
    return
  }
  res.writeHead(404)
  res.end()
}).listen(PORT, () => console.log(`quote-bench on http://localhost:${PORT}`))
