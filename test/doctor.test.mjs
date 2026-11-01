import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { envDoctor } from '../src/doctor.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
async function fixture() {
  const home = await mkdtemp(join(tmpdir(), 'dsh-env-'))
  await mkdir(join(home, 'profiles/web'), { recursive: true })
  await mkdir(join(home, 'sessions'), { recursive: true })
  await writeFile(join(home, 'profiles/web/cordis.patch.yml'), '[]\n')
  await writeFile(join(home, 'profiles/web/package.json'), '{}\n')
  return home
}
test('a complete local environment is PASS with a key', async () => {
  const home = await fixture()
  try {
    const r = await envDoctor({ home, profile: 'web', env: { DEEPSEEK_API_KEY: 'x' } })
    assert.equal(r.verdict, 'PASS')
    assert.equal(r.issues.length, 0)
  } finally { await rm(home, { recursive: true, force: true }) }
})
test('missing profile is BLOCK; missing key is WARN', async () => {
  const home = await fixture()
  try {
    const r = await envDoctor({ home, profile: 'missing', env: {} })
    assert.equal(r.verdict, 'BLOCK')
    assert.ok(r.issues.some((i) => i.includes('profile does not exist')))
    const warn = await envDoctor({ home, profile: 'web', env: {} })
    assert.equal(warn.verdict, 'WARN')
  } finally { await rm(home, { recursive: true, force: true }) }
})
test('plugin registers env_doctor and env-doctor', async () => {
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'env_doctor')
  const provider = factory()
  assert.equal((await provider.list())[0].name, 'env-doctor')
  assert.equal(await provider.get({ name: 'missing' }), undefined)
})
