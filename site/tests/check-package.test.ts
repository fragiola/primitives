import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    ADAPTERS,
    attwProblems,
    exportProblems,
    exportTargets,
    manifestProblems,
    missingTargets,
    packedProblems,
    pinnedPnpm,
    pnpmInvocation,
    publishedExportsProblems,
    relativeTo,
    servedImports,
    subpathProblems,
    TOOLKIT,
    tarballsOption,
    toolkitPinProblem,
    unlistedPackages,
    withoutSource,
} from "../../scripts/check-package.ts";
import { FRAMEWORKS } from "../../scripts/components.ts";

// `pnpm check:package` packs every package and smoke-tests the framework packages in scratch
// apps (network, minutes): these pin its pure checks on planted manifests.

const entry = (name: string, source = true) => ({
    ...(source ? { "@fragiola/source": `./src/${name}.ts` } : {}),
    types: `./dist/${name}.d.ts`,
    import: `./dist/${name}.js`,
    default: `./dist/${name}.js`,
});

const REPO_EXPORTS = {
    ".": entry("index"),
    "./dialog": entry("dialog"),
    "./package.json": "./package.json",
};

const PUBLISHED_EXPORTS = {
    ".": entry("index", false),
    "./dialog": entry("dialog", false),
    "./package.json": "./package.json",
};

const FILES = new Set([
    "./package.json",
    "./dist/index.js",
    "./dist/index.d.ts",
    "./dist/dialog.js",
    "./dist/dialog.d.ts",
]);

describe("exportProblems", () => {
    it("accepts dist-only exports with types, import and default", () => {
        expect(exportProblems(PUBLISHED_EXPORTS)).toEqual([]);
    });

    it("rejects the source condition and any other condition", () => {
        expect(exportProblems({ ".": entry("index") })).toEqual([
            'exports["."]: the "@fragiola/source" condition is published',
            'exports["."]["@fragiola/source"]: "./src/index.ts" is not in dist',
        ]);
        expect(
            exportProblems({ ".": { development: "./dist/index.js" } }),
        ).toEqual(['exports["."]: the "development" condition is published']);
    });

    it("rejects a target outside dist, or one the tarball does not hold", () => {
        expect(exportProblems({ ".": { default: "./index.js" } })).toEqual([
            'exports["."]["default"]: "./index.js" is not in dist',
        ]);
        expect(
            exportProblems(
                { ".": { default: "./fesm2022/x.mjs" } },
                "exports",
                (target) => target === "./fesm2022/x.mjs",
            ),
        ).toEqual([]);
    });

    it("rejects a value that is neither a string nor an object", () => {
        expect(exportProblems({ ".": 1 })).toEqual([
            'exports["."]: not a string or an object',
        ]);
    });
});

describe("targets and subpaths", () => {
    it("lists every target and the ones missing from the tarball", () => {
        expect(exportTargets(PUBLISHED_EXPORTS)).toContain("./dist/dialog.js");
        expect(missingTargets(PUBLISHED_EXPORTS, FILES)).toEqual([]);
        const files = new Set(FILES);
        files.delete("./dist/dialog.d.ts");
        expect(missingTargets(PUBLISHED_EXPORTS, files)).toEqual([
            'exports: "./dist/dialog.d.ts" is not in the tarball',
        ]);
    });

    it("finds an entry left out of the published exports, or one added", () => {
        expect(subpathProblems(REPO_EXPORTS, PUBLISHED_EXPORTS)).toEqual([]);
        const { "./dialog": _dialog, ...withoutDialog } = PUBLISHED_EXPORTS;
        expect(subpathProblems(REPO_EXPORTS, withoutDialog)).toEqual([
            'exports: the "./dialog" entry is not published',
        ]);
        expect(
            subpathProblems(REPO_EXPORTS, {
                ...PUBLISHED_EXPORTS,
                "./tabs": entry("tabs", false),
            }),
        ).toEqual([
            'exports: "./tabs" is published but is not an entry of the repo',
        ]);
    });
});

describe("published exports", () => {
    it("are the repo's without the source condition, in order", () => {
        expect(withoutSource(REPO_EXPORTS)).toEqual(PUBLISHED_EXPORTS);
        expect(
            publishedExportsProblems(REPO_EXPORTS, PUBLISHED_EXPORTS),
        ).toEqual([]);
        const reordered = {
            ".": {
                import: "./dist/index.js",
                types: "./dist/index.d.ts",
                default: "./dist/index.js",
            },
            "./dialog": entry("dialog", false),
            "./package.json": "./package.json",
        };
        expect(publishedExportsProblems(REPO_EXPORTS, reordered)).toHaveLength(
            1,
        );
    });

    it("are relative to the directory a package is packed from", () => {
        expect(
            relativeTo({ ".": { default: "./dist/fesm2022/x.mjs" } }, "dist"),
        ).toEqual({ ".": { default: "./fesm2022/x.mjs" } });
    });
});

describe("manifestProblems", () => {
    it("wants ESM and no side effects", () => {
        expect(
            manifestProblems({ type: "module", sideEffects: false }),
        ).toEqual([]);
        expect(manifestProblems({ sideEffects: ["*.css"] })).toEqual([
            '"type" is not "module"',
            '"sideEffects" is not false',
        ]);
    });
});

describe("packedProblems", () => {
    const packed = {
        type: "module",
        sideEffects: false,
        exports: PUBLISHED_EXPORTS,
    };

    it("passes a package packed as its repo manifest says", () => {
        expect(
            packedProblems({ exports: REPO_EXPORTS }, packed, FILES),
        ).toEqual([]);
    });

    it("fails a published source condition and a missing file", () => {
        const problems = packedProblems(
            { exports: REPO_EXPORTS },
            { ...packed, exports: REPO_EXPORTS },
            FILES,
        );
        expect(problems).toContain(
            'exports["."]: the "@fragiola/source" condition is published',
        );
        expect(problems).toContain(
            'exports: "./src/index.ts" is not in the tarball',
        );
    });

    it("checks a package packed from its build output against the tarball", () => {
        const repo = {
            exports: {
                ".": {
                    "@fragiola/source": "./src/public-api.ts",
                    types: "./dist/types/x.d.ts",
                    default: "./dist/fesm2022/x.mjs",
                },
                "./package.json": "./package.json",
            },
            publishConfig: { directory: "dist" },
        };
        const exports = {
            ".": { types: "./types/x.d.ts", default: "./fesm2022/x.mjs" },
            "./package.json": "./package.json",
        };
        const files = new Set([
            "./package.json",
            "./types/x.d.ts",
            "./fesm2022/x.mjs",
        ]);
        expect(packedProblems(repo, { ...packed, exports }, files)).toEqual([]);
        files.delete("./fesm2022/x.mjs");
        expect(packedProblems(repo, { ...packed, exports }, files)).toEqual([
            'exports["."]["default"]: "./fesm2022/x.mjs" is not in dist',
            'exports: "./fesm2022/x.mjs" is not in the tarball',
        ]);
    });
});

describe("toolkitPinProblem", () => {
    it("wants the toolkit at its exact version", () => {
        const adapter = (version?: string) => ({
            name: "@fragiola/primitives-react",
            dependencies:
                version === undefined ? {} : { [TOOLKIT.name]: version },
        });
        expect(toolkitPinProblem(adapter("1.2.3"), "1.2.3")).toBeUndefined();
        expect(toolkitPinProblem(adapter("^1.2.3"), "1.2.3")).toBe(
            '@fragiola/primitives-react depends on @fragiola/primitives at "^1.2.3", not at its exact version 1.2.3',
        );
        expect(toolkitPinProblem(adapter("workspace:*"), "1.2.3")).toMatch(
            /workspace:\*/,
        );
        expect(toolkitPinProblem(adapter(), "1.2.3")).toBe(
            "@fragiola/primitives-react does not depend on @fragiola/primitives",
        );
    });
});

describe("ADAPTERS", () => {
    it("has one framework package per framework", () => {
        expect(ADAPTERS.map((adapter) => adapter.dir)).toEqual([...FRAMEWORKS]);
        expect(ADAPTERS.map((adapter) => adapter.framework)).toEqual([
            ...FRAMEWORKS,
        ]);
    });

    it("finds a package that is neither the toolkit nor listed", () => {
        expect(
            unlistedPackages(["angular", "primitives", "react", "vue"]),
        ).toEqual([]);
        expect(unlistedPackages(["primitives", "react", "svelte"])).toEqual([
            "svelte",
        ]);
        expect(unlistedPackages(["react"], [])).toEqual(["react"]);
    });
});

describe("tarballsOption", () => {
    it("reads --tarballs in both spellings", () => {
        expect(tarballsOption([])).toBeUndefined();
        expect(tarballsOption(["--tarballs", "out"])).toBe("out");
        expect(tarballsOption(["--tarballs=out"])).toBe("out");
    });

    it("throws on a missing directory or an unknown argument", () => {
        expect(() => tarballsOption(["--tarballs"])).toThrow(
            "--tarballs needs a directory",
        );
        expect(() => tarballsOption(["--tarballs", "--check"])).toThrow(
            "--tarballs needs a directory",
        );
        expect(() => tarballsOption(["--tarballs="])).toThrow(
            "--tarballs needs a directory",
        );
        expect(() => tarballsOption(["--pack"])).toThrow(
            "unknown argument: --pack",
        );
    });
});

describe("servedImports", () => {
    it("lists the absolute and relative imports a served module makes", () => {
        const code = [
            'import { Dialog } from "/node_modules/.vite/deps/@fragiola_primitives-react_dialog.js?v=1";',
            'import "/@vite/client";',
            'import { a } from "./chunk-ABC.js";',
            'import react from "react";',
            'const lazy = import("../lazy.js");',
            "warn(\"import MyComponent from './MyComponent'\");",
        ].join("\n");
        expect(servedImports(code)).toEqual([
            "/node_modules/.vite/deps/@fragiola_primitives-react_dialog.js?v=1",
            "/@vite/client",
            "./chunk-ABC.js",
            "../lazy.js",
        ]);
    });
});

describe("attwProblems", () => {
    it("ignores the resolutions esm-only ignores, however a problem names them", () => {
        expect(
            attwProblems({
                InternalResolutionError: [
                    {
                        kind: "InternalResolutionError",
                        resolutionOption: "node10",
                        moduleSpecifier: "@fragiola/primitives-angular/dialog",
                    },
                ],
                CJSResolvesToESM: [
                    {
                        kind: "CJSResolvesToESM",
                        resolutionKind: "node16-cjs",
                        entrypoint: ".",
                    },
                ],
            }),
        ).toEqual([]);
    });

    it("keeps a problem of a resolution an ESM consumer uses", () => {
        expect(
            attwProblems([
                {
                    kind: "InternalResolutionError",
                    resolutionOption: "bundler",
                    moduleSpecifier: "./missing.js",
                    fileName: "/node_modules/x/index.d.ts",
                },
                {
                    kind: "NoResolution",
                    resolutionKind: "node16-esm",
                    entrypoint: "./tabs",
                },
                { kind: "FalseCJS" },
            ]),
        ).toEqual([
            "InternalResolutionError bundler ./missing.js /node_modules/x/index.d.ts",
            "NoResolution node16-esm ./tabs",
            "FalseCJS",
        ]);
    });
});

// Epic #22 (#21): the scratch apps install and build with the pinned pnpm, never the machine's.
describe("the scratch apps' pnpm", () => {
    it("is the version package.json pins", () => {
        expect(pinnedPnpm({ packageManager: "pnpm@12.21.0" })).toBe("12.21.0");
        expect(() => pinnedPnpm({ packageManager: "pnpm@^12" })).toThrow();
        expect(() => pinnedPnpm({})).toThrow();
    });

    it("runs the machine's pnpm when it is the pinned one, else pnpm dlx of the pinned", () => {
        expect(pnpmInvocation("12.21.0", "12.21.0\n")).toEqual({
            command: "pnpm",
            prefix: [],
        });
        expect(pnpmInvocation("12.21.0", "11.2.0")).toEqual({
            command: "pnpm",
            prefix: ["dlx", "pnpm@12.21.0"],
        });
    });

    it("pins the repository's pnpm in every scratch app's manifest", () => {
        const source = readFileSync(
            join(import.meta.dirname, "../../scripts/check-package.ts"),
            "utf8",
        );
        expect(
            source.match(/packageManager: `pnpm@\$\{PINNED_PNPM\}`/g),
        ).toHaveLength(3);
        // every pnpm command in a scratch app goes through the pinned one (publint runs in the
        // repository, with its own pinned pnpm)
        expect(source).not.toMatch(
            /run\("pnpm", \["(install|exec", "(tsc|vite|vue-tsc|ngc))"/,
        );
    });
});
