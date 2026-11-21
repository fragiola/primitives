// What the bundle guard's apps (`fixtures/<framework>/guard/`) share in their Vite configs: the
// packages from their **built** entries (no source condition: what an app installs), and the
// source maps of those built files chained into the app's, so that the app's source map names
// the packages' own sources (`packages/react/src/components/dialog/...`,
// `packages/primitives/src/overlay/...`): scripts/check-bundle.ts reads them.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

/** A built file of a workspace package: `packages/<name>/dist/...`. */
const BUILT = /[\\/]packages[\\/][^\\/]+[\\/]dist[\\/].+\.m?js$/;

/** Loads a package's built file with its source map, so the app's map chains to the sources. */
export function builtSourceMaps(): Plugin {
    return {
        name: "built-source-maps",
        enforce: "pre",
        load(id) {
            const file = id.split("?")[0] ?? id;
            if (!BUILT.test(file) || !existsSync(`${file}.map`)) {
                return null;
            }
            return {
                code: readFileSync(file, "utf8"),
                map: readFileSync(`${file}.map`, "utf8"),
            };
        },
    };
}

/** The guard app's build options: one minified bundle with its source map, in `guard/dist`. */
export function guardBuild(dir: string) {
    return {
        root: dir,
        logLevel: "warn" as const,
        build: {
            outDir: join(dir, "dist"),
            emptyOutDir: true,
            sourcemap: true,
            minify: true,
        },
    };
}
