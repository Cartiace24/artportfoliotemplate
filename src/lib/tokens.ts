/** Token helpers — SHA-256 hex hashing (client side, no secret exposure) */

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateManageToken(lengthBytes = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(lengthBytes))
  // URL-safe base64 without padding
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
