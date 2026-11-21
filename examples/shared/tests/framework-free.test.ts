// Adapted from Tree (fragiola/tree, examples/shared/tests/framework-free.test.ts), same author and
// licence.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { importsOf } from "../scripts/examples-lib.ts";

// What every framework's app shares imports no framework (and no primitives package): the
// metadata, the recipes, the themes, the embed protocol, the overlay promotion, the scripts and
// the e2e specs work the same for React, Vue and Angular.

const ROOT = join(import.meta.dirname, "..");
const FORBIDDEN = [
    /^react(-dom)?(\/|$)/,
    /^vue(\/|$)/,
    /^@angular\//,
    /^@fragiola\/primitives-(react|vue|angular)(\/|$)/,
];

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? walk(path) : [path];
    });
}

describe("examples-shared", () => {
    it("imports no framework", () => {
        const files = ["src", "scripts", "e2e"]
            .flatMap((dir) => walk(join(ROOT, dir)))
            .filter((file) => file.endsWith(".ts"));
        expect(files.length).toBeGreaterThan(10);
        for (const file of files) {
            for (const specifier of importsOf(readFileSync(file, "utf-8"))) {
                for (const pattern of FORBIDDEN) {
                    expect(
                        pattern.test(specifier),
                        `${relative(ROOT, file)} imports ${specifier}`,
                    ).toBe(false);
                }
            }
        }
    });

    it("is what each framework's embed host uses for the protocol and the promotion", () => {
        for (const [framework, main] of [
            ["react", "main.tsx"],
            ["vue", "main.ts"],
            ["angular", "main.ts"],
        ] as const) {
            const source = readFileSync(
                join(ROOT, "..", framework, "src", "embed", main),
                "utf-8",
            );
            expect(importsOf(source), framework).toEqual(
                expect.arrayContaining([
                    "examples-shared/embed/messages",
                    "examples-shared/embed/overlay-promotion",
                ]),
            );
            expect(source, framework).toContain("promoteOverlays(id)");
        }
    });
});
