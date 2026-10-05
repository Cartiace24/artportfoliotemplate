/**
 * Generate a management token + its SHA-256 hash.
 * Usage: node scripts/generate-manage-token.mjs
 * Then insert ONLY the hash into management_access:
 *   insert into management_access (site_id, token_hash) values ('<site-id>', '<hash>');
 * And share the link: https://your-site.com/manage/<token>
 */
import { randomBytes, createHash } from 'node:crypto'

const token = randomBytes(32).toString('base64url')
const hash = createHash('sha256').update(token).digest('hex')

console.log('Manage link path: /manage/' + token)
console.log('Token (give to client, store in password manager):')
console.log(token)
console.log('')
console.log('SHA-256 hash (store in management_access.token_hash):')
console.log(hash)
