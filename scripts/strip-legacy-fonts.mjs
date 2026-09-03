/**
 * Drops the legacy WOFF font faces left behind by the Vite font plugin.
 *
 * The plugin emits one @font-face for WOFF2 and a second, separate one for
 * WOFF with the same family, weight and unicode-range. Because they are two
 * rules rather than one rule with a fallback `src` list, a browser downloads
 * both — and for some faces it picks the later, larger WOFF. That was roughly
 * 69 KB of waste on a first visit.
 *
 * Every browser in use supports WOFF2, so the WOFF faces are removed from the
 * generated stylesheet and manifest, and their files deleted from the build.
 *
 * Runs after `vite build`; see the `build` script in package.json.
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

const BUILD = 'public/build'
const MANIFEST = join(BUILD, 'fonts-manifest.json')

if (! existsSync(MANIFEST)) {
    console.log('strip-legacy-fonts: no font manifest, nothing to do')
    process.exit(0)
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const orphans = new Set()

for (const family of Object.values(manifest.families ?? {})) {
    for (const variant of Object.values(family.variants ?? {})) {
        const keep = []

        for (const file of variant.files ?? []) {
            if (file.format === 'woff2') {
                keep.push(file)
            } else if (file.file) {
                orphans.add(file.file)
            }
        }

        // Only drop the legacy face when a WOFF2 of the same variant remains.
        variant.files = keep.length > 0 ? keep : variant.files
    }
}

// The stylesheet the manifest points at carries the same duplicate rules.
const stylePath = manifest.style?.file ? join(BUILD, manifest.style.file) : null

if (stylePath && existsSync(stylePath)) {
    const css = readFileSync(stylePath, 'utf8')

    const kept = css
        .split('@font-face')
        .filter((block, index) => index === 0 || ! /format\("woff"\)/.test(block))
        .join('@font-face')

    writeFileSync(stylePath, kept)
}

let removed = 0

for (const file of orphans) {
    const path = join(BUILD, file)

    if (existsSync(path)) {
        unlinkSync(path)
        removed++
    }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))

console.log(`strip-legacy-fonts: removed ${removed} legacy WOFF file${removed === 1 ? '' : 's'}`)
