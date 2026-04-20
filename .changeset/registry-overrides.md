---
"@pnpm/types": minor
"@pnpm/config.pick-registry-for-package": minor
"@pnpm/config.reader": minor
"@pnpm/resolving.npm-resolver": minor
"@pnpm/deps.inspection.outdated": minor
"@pnpm/deps.inspection.commands": minor
"@pnpm/installing.env-installer": minor
"@pnpm/registry-access.commands": minor
"@pnpm/releasing.commands": minor
"@pnpm/store.connection-manager": minor
"pnpm": minor
---

Added a new `registryOverrides` setting for mixing public and private packages within the same scope.

A package whose exact name matches a key in `registryOverrides` is resolved from the given registry URL, taking precedence over the scope's entry in `registries`. Authentication is picked up from the existing per-URL `.npmrc` entries (e.g. `//npm.pkg.github.com/:_authToken=...`), so no separate auth mechanism is required.

Example (in `pnpm-workspace.yaml`):

```yaml
registryOverrides:
  "@foo/private-lib": https://npm.pkg.github.com/
  "@foo/internal-tools": https://npm.pkg.github.com/
```

With this, `@foo/public` still comes from the default npm registry (or whatever `@foo:registry` is set to), while `@foo/private-lib` and `@foo/internal-tools` are fetched from GitHub Packages. `pnpm publish` on an overridden package also targets the override URL.

### Why this shape

pnpm already supports npm-style `@scope:registry` lookups, but a scope can only map to a single registry. Until now, projects that needed to mix public and private packages within one scope had to either move packages to a different scope or implement a custom resolver in `.pnpmfile.cjs`. This adds a declarative option that plugs into the existing single-function registry lookup (`pickRegistryForPackage`) without changing any other semantics.

### Alternatives considered

- **Registry fallback arrays** (try private registry, fall back to public on 404). Rejected: every install would become multiple round-trips, 404-vs-auth-failure is ambiguous, metadata provenance becomes non-deterministic, and it is hostile to pnpm's reproducibility guarantees. npm itself does not support this cleanly either.
- **Glob patterns** (e.g. `@foo/private-*`). Rejected for v1: there is no precedent in `.npmrc`, and exact-match keyed by full package name covers the common "a handful of private packages in one scope" case. Glob support can be added later without breaking the current shape if demand emerges.
- **Extending the `registries` map to accept `string | string[]` or nested objects.** Rejected: `registries` is a flat scope-to-URL lookup used in dozens of places and serialized into the lockfile in several spots; changing its shape has a large blast radius for a small gain.
- **Status quo: custom resolver in `.pnpmfile.cjs`.** Works today (see `CustomResolver` in `@pnpm/hooks.types`), but is imperative boilerplate for what is really a piece of configuration. Not reviewable as declarative intent in a workspace manifest.

### Compatibility

- `.npmrc` behavior, including `@scope:registry` entries, is unchanged.
- `registries` in `pnpm-workspace.yaml` continues to work as before.
- If `registryOverrides` is not set, behavior is exactly as before.
- Auth for override URLs is resolved via the existing per-URL credential lookup (`createGetAuthHeaderByURI` + `nerfDart`), so no new auth surface is introduced.
