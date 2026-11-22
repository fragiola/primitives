import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Epic #22 (#18): an axe check measured during an overlay's enter transition finds a half-faded
// popup's colour contrast (the Angular Dialog example's intermittent failure). Every example's axe
// check goes through `axeViolations` (e2e/helpers.ts), which waits for the page's animations
// first, in every framework; none disables a rule.

const SPECS = join(import.meta.dirname, "../e2e/examples");

describe("the examples' axe checks", () => {
    const specs = readdirSync(SPECS).filter((name) =>
        name.endsWith(".spec.ts"),
    );

    it("go through axeViolations, never AxeBuilder directly", () => {
        for (const name of specs) {
            const source = readFileSync(join(SPECS, name), "utf8");
            expect(source, name).not.toMatch(/AxeBuilder/);
        }
        expect(
            specs.filter((name) =>
                readFileSync(join(SPECS, name), "utf8").includes(
                    "axeViolations(page)",
                ),
            ).length,
        ).toBe(specs.length);
    });

    it("disable no rule", () => {
        for (const name of specs) {
            const source = readFileSync(join(SPECS, name), "utf8");
            expect(source, name).not.toMatch(/disableRules|\.exclude\(/);
        }
        const helpers = readFileSync(
            join(import.meta.dirname, "../e2e/helpers.ts"),
            "utf8",
        );
        expect(helpers).toMatch(
            /await settleAnimations\(page\);\n\s+return \(await new AxeBuilder/,
        );
        expect(helpers).not.toMatch(/disableRules/);
    });
});
