# Env Doctor for DSH

> First-run environment checks: Node, DSH_HOME, writability, profile files, sessions, and API-key
> presence. Local-only; no network, no key value read.

## Use

```bash
node bin/dsh-env-doctor.mjs --home ~/.dsh --profile web
node bin/dsh-env-doctor.mjs --json
```

In DSH:

```text
Use env_doctor with profile=web.
```

## Checks

- Node major ≥ 20
- DSH_HOME exists and is writable
- `profiles/<name>/cordis.patch.yml` and `package.json`
- sessions directory
- `DEEPSEEK_API_KEY` presence

## Limits

- No provider auth probe, network, plugin execution, or repair.
- Layout may differ across DSH versions.
- Presence of a key is not proof that it is valid.

## Tests

```bash
npm test
```

## Provenance

A small independent environment check. License: MIT.
