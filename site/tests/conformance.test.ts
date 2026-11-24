import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { IMPLEMENTATIONS } from "../../conformance/src/implementations.ts";
import { FRAMEWORKS } from "../../scripts/components.ts";

const root = join(import.meta.dirname, "../..");

// The conformance suite runs every framework (D6): CI's jobs follow `fixtures/*`
// (scripts/e2e-suites.ts), the suite's projects follow IMPLEMENTATIONS. They stay the same list.
describe("the conformance registry", () => {
    it("registers every fixture, and every framework package has one", () => {
        const fixtures = readdirSync(join(root, "fixtures"))
            .filter((name) =>
                existsSync(join(root, "fixtures", name, "package.json")),
            )
            .sort();
        expect(
            IMPLEMENTATIONS.map((implementation) => implementation.name).sort(),
        ).toEqual(fixtures);
        expect([...FRAMEWORKS].sort()).toEqual(fixtures);
    });

    it("names each fixture's package, on its own port, with every layer", () => {
        const ports = new Set<number>();
        for (const implementation of IMPLEMENTATIONS) {
            const manifest = JSON.parse(
                readFileSync(
                    join(root, "fixtures", implementation.name, "package.json"),
                    "utf8",
                ),
            ) as { name: string; scripts: Record<string, string> };
            expect(manifest.name).toBe(implementation.fixture);
            expect(manifest.scripts.dev).toContain(String(implementation.port));
            ports.add(implementation.port);
            ports.add(implementation.ssrPort);
            expect([...implementation.layers].sort()).toEqual([
                "behaviour",
                "contract",
                "ssr",
                "visual",
            ]);
        }
        expect(ports.size).toBe(IMPLEMENTATIONS.length * 2);
    });

    // a spec with no scenario of its own (spec/color.md, the toolkit's color model, Epic #99) is
    // held by the toolkit's unit tests and its components' specs
    it("has a test folder per component, with the three layers", () => {
        for (const component of readdirSync(join(root, "spec")).filter(
            (name) =>
                name.endsWith(".md") &&
                name !== "README.md" &&
                /\n### `\//.test(
                    readFileSync(join(root, "spec", name), "utf8"),
                ),
        )) {
            const dir = join(
                root,
                "conformance/tests",
                component.replace(".md", ""),
            );
            for (const layer of ["behaviour", "contract", "visual"]) {
                expect(
                    existsSync(join(dir, `${layer}.test.ts`)),
                    `${dir} ${layer}`,
                ).toBe(true);
            }
        }
    });
});

// Epic #22 (#20): every fixture renders on the server too, for the ssr layer.
describe("the ssr layer", () => {
    it("has a server entry and a build:ssr script in every fixture", () => {
        for (const implementation of IMPLEMENTATIONS) {
            const dir = join(root, "fixtures", implementation.name);
            const manifest = JSON.parse(
                readFileSync(join(dir, "package.json"), "utf8"),
            ) as { scripts: Record<string, string> };
            expect(manifest.scripts["build:ssr"]).toMatch(
                /vite build --ssr src\/server\/entry-server\.tsx? --outDir dist-ssr\/server/,
            );
            expect(
                ["entry-server.ts", "entry-server.tsx"].some((name) =>
                    existsSync(join(dir, "src/server", name)),
                ),
            ).toBe(true);
        }
    });
});
