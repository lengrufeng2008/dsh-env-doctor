#!/usr/bin/env node
import { envDoctor, renderMarkdown } from '../src/doctor.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-env-doctor [--home DIR] [--profile NAME] [--json]\\n\\nCheck Node, DSH_HOME, profile files, writability, sessions, API key presence.'); process.exit(0) }
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
try {
  const report = await envDoctor({ home: value('--home'), profile: value('--profile') })
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else console.log(renderMarkdown(report))
  process.exitCode = report.verdict === 'BLOCK' ? 1 : 0
} catch (error) { console.error(`dsh-env-doctor: ${error.message}`); process.exitCode = 2 }
