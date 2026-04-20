# @pnpm/pick-registry-for-package

> Picks the right registry for the package from a registries config

## Installation

```
pnpm add @pnpm/pick-registry-for-package
```

## API

```ts
import { pickRegistryForPackage } from '@pnpm/config.pick-registry-for-package'

pickRegistryForPackage(
  registries,       // { default: string, [scope: string]: string }
  packageName,      // e.g. '@foo/bar' or 'lodash' — can be a local alias
  bareSpecifier?,   // e.g. 'npm:@foo/bar@1.2.3' (for aliased deps)
  registryOverrides?, // { [exactPackageName: string]: string }
): string
```

Resolution order:

1. If `registryOverrides` contains an exact match for the real package name,
   that URL is returned. This is how the `registryOverrides` setting from
   `pnpm-workspace.yaml` lets a single package in a scope (e.g. `@foo/private`)
   be served from a different registry than the rest of the scope.
2. Otherwise, if the (resolved) package name is scoped and that scope is a key
   in `registries`, the scope's registry URL is returned.
3. Otherwise, `registries.default` is returned.

When `bareSpecifier` is an `npm:` aliased specifier (e.g. `npm:@foo/private@1`),
the real package name is extracted from the specifier for both the override
lookup and the scope lookup.

## License

[MIT](LICENSE)
