import type { Registries } from '@pnpm/types'

export function pickRegistryForPackage (
  registries: Registries,
  packageName: string,
  bareSpecifier?: string,
  registryOverrides?: Record<string, string>
): string {
  const realName = getRealPackageName(packageName, bareSpecifier)
  if (registryOverrides?.[realName]) return registryOverrides[realName]
  const scope = getScopeFromName(realName)
  return (scope && registries[scope]) ?? registries.default
}

function getRealPackageName (pkgName: string, bareSpecifier?: string): string {
  if (bareSpecifier?.startsWith('npm:')) {
    const rest = bareSpecifier.slice(4)
    // Strip the version tail: "@foo/pkg@1.2.3" -> "@foo/pkg", "pkg@1.2.3" -> "pkg".
    // In a scoped name, the name-version separator is the second '@'.
    const versionAt = rest.indexOf('@', rest[0] === '@' ? 1 : 0)
    return versionAt > 0 ? rest.slice(0, versionAt) : rest
  }
  return pkgName
}

function getScopeFromName (pkgName: string): string | null {
  if (pkgName[0] !== '@') return null
  const slashIdx = pkgName.indexOf('/')
  return slashIdx > 0 ? pkgName.substring(0, slashIdx) : null
}
