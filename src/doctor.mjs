import { access, readFile, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export async function envDoctor({ home = process.env.DSH_HOME || join(homedir(), '.dsh'), profile = 'web', env = process.env } = {}) {
  const issues = []
  const warnings = []
  const checks = []
  const major = Number(process.versions.node.split('.')[0])
  checks.push({ name: 'node', value: process.versions.node, ok: major >= 20 })
  if (major < 20) issues.push(`Node ${process.versions.node} is too old; use Node 20+`)
  const homeInfo = await stat(home).catch(() => null)
  checks.push({ name: 'dsh-home', value: home, ok: Boolean(homeInfo?.isDirectory()) })
  if (!homeInfo?.isDirectory()) issues.push(`DSH_HOME does not exist: ${home}`)
  else {
    try { await access(home, constants.W_OK); checks.push({ name: 'writable', value: 'yes', ok: true }) }
    catch { checks.push({ name: 'writable', value: 'no', ok: false }); issues.push(`DSH_HOME is not writable: ${home}`) }
  }
  const profilePath = join(home, 'profiles', profile)
  const profileInfo = await stat(profilePath).catch(() => null)
  checks.push({ name: 'profile', value: profilePath, ok: Boolean(profileInfo?.isDirectory()) })
  if (!profileInfo?.isDirectory()) issues.push(`profile does not exist: ${profile}`)
  else {
    for (const file of ['cordis.patch.yml', 'package.json']) {
      const ok = Boolean(await stat(join(profilePath, file)).catch(() => null))
      checks.push({ name: file, value: ok ? 'present' : 'missing', ok })
      if (!ok) issues.push(`profile is missing ${file}`)
    }
  }
  const sessions = join(home, 'sessions')
  const sessionsOk = Boolean(await stat(sessions).catch(() => null))
  checks.push({ name: 'sessions', value: sessionsOk ? 'present' : 'missing', ok: true })
  if (!sessionsOk) warnings.push('no sessions directory yet; it is created after the first run')
  const key = Boolean(env.DEEPSEEK_API_KEY)
  checks.push({ name: 'api-key', value: key ? 'present' : 'missing', ok: true })
  if (!key) warnings.push('DEEPSEEK_API_KEY is not set in this environment')
  return { home, profile, checks, issues, warnings, verdict: issues.length ? 'BLOCK' : warnings.length ? 'WARN' : 'PASS' }
}
export function renderMarkdown(report) {
  const lines = [`# DSH environment: ${report.verdict}`, '', '| Check | Value | OK |', '| --- | --- | --- |', ...report.checks.map((c) => `| ${c.name} | ${c.value} | ${c.ok ? 'yes' : 'no'} |`), '']
  for (const i of report.issues) lines.push(`- BLOCK ${i}`)
  for (const w of report.warnings) lines.push(`- WARN ${w}`)
  if (!report.issues.length && !report.warnings.length) lines.push('No issues under these checks.')
  lines.push('', 'Local checks only; no network.')
  return lines.join('\n')
}
