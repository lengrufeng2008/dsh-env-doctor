---
name: env-doctor
description: Check Node version, DSH_HOME, profile files, writability, sessions, and API-key presence. Local-only; no network and no key value read.
whenToUse: "First-run setup fails, a profile cannot boot, or a user asks why DSH is not starting."
---

# Environment doctor

```text
Use env_doctor with home=~/.dsh profile=web.
```

Checks: Node 20+, DSH_HOME, writability, profile directory, `cordis.patch.yml`, `package.json`,
sessions directory, and whether `DEEPSEEK_API_KEY` is set (presence only; value never read).

## Limits

- No network, provider auth probe, plugin execution, or repair.
- Profile layout can differ across DSH versions; treat a missing file as a prompt to inspect, not proof.
- `BLOCK` means a basic local prerequisite failed, not that DSH is unsupported.
