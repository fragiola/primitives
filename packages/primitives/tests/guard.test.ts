import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { MECHANISMS } from "../../../scripts/components.ts";

const root = join(import.meta.dirname, "..");

function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? files(path) : [path];
    });
}

const sources = files(join(root, "src")).filter((file) => file.endsWith(".ts"));

/**
 * A source with its comments and string literals blanked out, so only code is scanned; its line
 * breaks are kept, so a line number is the source's.
 */
function codeOf(file: string): string {
    return readFileSync(file, "utf8").replace(
        /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g,
        (match) =>
            match.startsWith("/")
                ? match.replace(/[^\n]/g, "")
                : `""${match.replace(/[^\n]/g, "")}`,
    );
}

/** The files whose code matches `pattern`, relative to the package. */
function offenders(pattern: RegExp, list = sources): string[] {
    return list
        .filter((file) => pattern.test(codeOf(file)))
        .map((file) => relative(root, file));
}

// AGENTS.md rule 2: the toolkit is framework-free DOM behaviour and pure math.
describe("the @fragiola/primitives boundary", () => {
    it("imports no framework", () => {
        expect(
            sources.filter((file) =>
                /from\s+["'](react|react-dom|vue|@vue\/[^"']+|@angular\/[^"']+|svelte|solid-js)(\/[^"']*)?["']/.test(
                    readFileSync(file, "utf8"),
                ),
            ),
        ).toEqual([]);
    });

    it("has @floating-ui/dom as its only runtime dependency", () => {
        const manifest = JSON.parse(
            readFileSync(join(root, "package.json"), "utf8"),
        ) as {
            dependencies?: Record<string, string>;
            peerDependencies?: Record<string, string>;
        };
        expect(Object.keys(manifest.dependencies ?? {})).toEqual([
            "@floating-ui/dom",
        ]);
        expect(manifest.peerDependencies).toBeUndefined();
        // only the positioning mechanism reaches it at runtime
        expect(
            sources
                .filter((file) =>
                    /^import\s+\{[^}]*\}\s+from\s+"@floating-ui\/dom"/m.test(
                        readFileSync(file, "utf8"),
                    ),
                )
                .map((file) => relative(root, file)),
        ).toEqual(["src/positioning/anchor-floating.ts"]);
    });

    it("never touches the global document or window", () => {
        // an element's ownerDocument and defaultView only: a toolkit function works in an iframe,
        // a shadow root or a test's own document
        expect(
            offenders(
                /(?<![\w$.])(document|window|globalThis|self|requestAnimationFrame|cancelAnimationFrame|getComputedStyle|matchMedia|crypto|localStorage|navigator)(?![\w$])\s*[.(]/,
            ),
        ).toEqual([]);
    });

    it("has no top-level side effects", () => {
        // at the top level, a module only imports, exports and declares: no call, no assignment,
        // no listener, so `"sideEffects": false` holds and an unused mechanism is dropped
        const DECLARATION =
            /^(import|export|const|let|function|async function|class|interface|type|enum|declare|abstract class|\}|\)|\]|>|$)/;
        const problems: string[] = [];
        for (const file of sources) {
            const raw = readFileSync(file, "utf8").split("\n");
            const lines = codeOf(file).split("\n");
            lines.forEach((line, index) => {
                if (/^\S/.test(line) && !DECLARATION.test(line)) {
                    problems.push(
                        `${relative(root, file)}:${index + 1}: ${line}`,
                    );
                }
                // a top-level constant computed by a call runs on import,
                const call =
                    /^(export\s+)?(const|let)\s+[\w$]+(\s*:[^=]+)?\s*=\s*(new\s+)?[\w$.]+\s*\(/.exec(
                        line,
                    );
                // unless the call is marked pure (`/* @__PURE__ */`), which bundlers drop unused
                if (call !== null && !raw[index]?.includes("@__PURE__")) {
                    problems.push(
                        `${relative(root, file)}:${index + 1}: ${line}`,
                    );
                }
            });
        }
        expect(problems).toEqual([]);
    });

    it("has no `any` in its sources", () => {
        expect(offenders(/(?<![\w$])any(?![\w$])/)).toEqual([]);
    });
});

// AGENTS.md rule 6 (D8): one entry per mechanism, and a root entry that only re-exports.
describe("the entries", () => {
    const manifest = JSON.parse(
        readFileSync(join(root, "package.json"), "utf8"),
    ) as {
        sideEffects: unknown;
        exports: Record<string, unknown>;
        publishConfig: { exports: Record<string, unknown> };
    };

    it("is one entry per mechanism folder, plus the root", () => {
        const folders = readdirSync(join(root, "src"))
            .filter((name) => statSync(join(root, "src", name)).isDirectory())
            .sort();
        expect(folders).toEqual(MECHANISMS);
        expect(Object.keys(manifest.exports)).toEqual([
            ".",
            ...MECHANISMS.map((name) => `./${name}`),
            "./package.json",
        ]);
        expect(Object.keys(manifest.publishConfig.exports)).toEqual(
            Object.keys(manifest.exports),
        );
        expect(manifest.sideEffects).toBe(false);
    });

    it("has a root entry that only re-exports the mechanisms' entries", () => {
        const lines = codeOf(join(root, "src/index.ts"))
            .split("\n")
            .filter((line) => line.trim() !== "");
        expect(lines).toEqual(MECHANISMS.map(() => `export * from "";`));
        expect(readFileSync(join(root, "src/index.ts"), "utf8")).toContain(
            MECHANISMS.map(
                (name) => `export * from "./${name}/index.ts";`,
            ).join("\n"),
        );
    });

    it("has entries that only re-export their own folder's modules", () => {
        for (const name of MECHANISMS) {
            const entry = readFileSync(
                join(root, "src", name, "index.ts"),
                "utf8",
            );
            for (const match of entry.matchAll(/from\s+"([^"]+)"/g)) {
                expect(match[1], `${name}/index.ts`).toMatch(
                    /^\.\/[a-z-]+\.ts$/,
                );
            }
            expect(codeOf(join(root, "src", name, "index.ts"))).not.toMatch(
                /^(const|let|function|class)\b/m,
            );
        }
    });
});
