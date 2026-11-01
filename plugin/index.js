import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { envDoctor, renderMarkdown } from '../src/doctor.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'env-doctor', 'SKILL.md')
const PROVIDER = 'dsh-env-doctor'
export const name = 'env-doctor'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'env-doctor', description: 'Check Node, DSH_HOME, profile files, writability, sessions, and API-key presence. Local-only; no network.', whenToUse: 'First-run setup fails or a DSH profile looks broken.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'env-doctor') }, rank: 600, locator: 'env-doctor', metadata: { domain: 'setup', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'env_doctor', description: 'Check Node, DSH_HOME, profile files, writability, sessions, and API-key presence. Does not read the API key value and does not use the network.', parameters: { type: 'object', additionalProperties: false, properties: { home: { type: 'string' }, profile: { type: 'string' } } }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, verdict: { type: 'string' }, issues: { type: 'integer' }, warnings: { type: 'integer' } }, required: ['markdown', 'verdict', 'issues', 'warnings'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 20_000, async execute(args = {}) { const r = await envDoctor({ home: args.home, profile: args.profile }); return { markdown: renderMarkdown(r), verdict: r.verdict, issues: r.issues.length, warnings: r.warnings.length } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'env-doctor') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
