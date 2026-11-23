import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ENTRIES, entrySource } from "../../scripts/components.ts";

const root = join(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const manifest = (pkg: string) =>
    JSON.parse(read(`packages/${pkg}/package.json`)) as {
        sideEffects: unknown;
        exports: Record<string, unknown>;
        dependencies?: Record<string, string>;
        publishConfig?: { exports?: Record<string, unknown> };
    };

// AGENTS.md rule 6 (D8): one entry per component in every framework package, and one per utility
// (the direction provider, the render utilities: Epic #26), driven by the one list
// (scripts/components.ts), and a root entry that only re-exports them.
describe("the framework packages' entries", () => {
    for (const pkg of ["react", "vue"]) {
        it(`${pkg}: one subpath per component and utility, and a root that only re-exports them`, () => {
            const { exports, publishConfig, sideEffects } = manifest(pkg);
            expect(Object.keys(exports)).toEqual([
                ".",
                ...ENTRIES.map((name) => `./${name}`),
                "./package.json",
            ]);
            expect(Object.keys(publishConfig?.exports ?? {})).toEqual(
                Object.keys(exports),
            );
            expect(sideEffects).toBe(false);
            for (const name of ENTRIES) {
                expect(
                    existsSync(
                        join(root, `packages/${pkg}/${entrySource(name)}`),
                    ),
                ).toBe(true);
            }
            const entry = read(`packages/${pkg}/src/index.ts`)
                .split("\n")
                .filter((line) => line !== "" && !line.startsWith("//"));
            // Biome sorts the re-exports by path, segment by segment: `./async-list` comes before
            // `./components`, `./components/autocomplete` before `./components/autocomplete-virtual`
            const bySegments = (a: string, b: string) => {
                const left = a.split("/");
                const right = b.split("/");
                for (let i = 0; i < Math.min(left.length, right.length); i++) {
                    const x = left[i] as string;
                    const y = right[i] as string;
                    if (x !== y) return x < y ? -1 : 1;
                }
                return left.length - right.length;
            };
            expect(entry).toEqual(
                ENTRIES.map((name) => entrySource(name).slice("src/".length))
                    .sort(bySegments)
                    .map((source) => `export * from "./${source}";`),
            );
        });
    }

    it("angular: one secondary entry point per component and utility, and a root that only re-exports them", () => {
        const { exports, sideEffects } = manifest("angular");
        expect(Object.keys(exports)).toEqual([
            ".",
            "./internal",
            ...ENTRIES.map((name) => `./${name}`),
            "./package.json",
        ]);
        expect(sideEffects).toBe(false);
        for (const name of ENTRIES) {
            expect(
                existsSync(
                    join(root, `packages/angular/${name}/ng-package.json`),
                ),
            ).toBe(true);
            expect(
                existsSync(
                    join(root, `packages/angular/${name}/public-api.ts`),
                ),
            ).toBe(true);
        }
        const entry = read("packages/angular/src/public-api.ts")
            .split("\n")
            .filter((line) => line !== "" && !line.startsWith("//"));
        // Biome sorts the re-exports: the utilities fall among the components
        expect(entry).toEqual(
            [...ENTRIES]
                .sort()
                .map(
                    (name) =>
                        `export * from "@fragiola/primitives-angular/${name}";`,
                ),
        );
    });

    it("never re-export the toolkit, and depend on it as the workspace version", () => {
        for (const pkg of ["react", "vue", "angular"]) {
            expect(manifest(pkg).dependencies).toEqual({
                "@fragiola/primitives": "workspace:*",
            });
        }
        // a framework package re-exports only toolkit types (guidelines decisions.md#np-toolkit-re-export)
        const offenders = ["react", "vue"].flatMap((pkg) =>
            [read(`packages/${pkg}/src/index.ts`)].filter((source) =>
                /export \*\s+from\s+"@fragiola\/primitives/.test(source),
            ),
        );
        expect(offenders).toEqual([]);
        expect(read("packages/angular/src/public-api.ts")).not.toMatch(
            /from\s+"@fragiola\/primitives(\/|")/,
        );
    });
});

describe("no plugin, module or provider that references every component", () => {
    it("has no Vue app.use() plugin and no Angular NgModule", () => {
        const sources = [
            read("packages/vue/src/index.ts"),
            ...ENTRIES.map((name) => read(`packages/vue/${entrySource(name)}`)),
        ]
            .join("\n")
            .replace(/\/\/[^\n]*/g, "");
        expect(sources).not.toMatch(/install\s*\(|app\.use|Plugin/);
        for (const name of ENTRIES) {
            expect(read(`packages/angular/${name}/public-api.ts`)).not.toMatch(
                /NgModule/,
            );
        }
    });
});
