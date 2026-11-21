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
            expect([...implementation.layers].sort()).toEqual([
                "behaviour",
                "contract",
                "visual",
            ]);
        }
        expect(ports.size).toBe(IMPLEMENTATIONS.length);
    });

    it("has a test folder per component, with the three layers", () => {
        for (const component of readdirSync(join(root, "spec")).filter(
            (name) => name.endsWith(".md") && name !== "README.md",
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
