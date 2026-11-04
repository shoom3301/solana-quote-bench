const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com'
const MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

async function relay(url, init) {
  try {
    const r = await fetch(url, { ...init, headers: { 'user-agent': 'quote-bench/1.0', ...(init?.headers || {}) } })
    return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 })
  }
}

export async function cow(request) {
  if (request.method !== 'POST') return new Response(null, { status: 405 })
  return relay('https://api.cow.fi/solana/api/v1/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: await request.text(),
  })
}

export function kamino(request) {
  return relay('https://api.kamino.finance/kswap/v2/swap' + new URL(request.url).search)
}

export function decimals(request) {
  const mint = new URL(request.url).searchParams.get('mint') || ''
  if (!MINT_RE.test(mint)) return Response.json({ error: 'invalid mint' }, { status: 400 })
  return relay(SOLANA_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenSupply', params: [mint] }),
  })
}
