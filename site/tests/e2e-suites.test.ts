import { describe, expect, it } from "vitest";
import {
    e2eSuites,
    needOf,
    repositoryFrameworks,
} from "../../scripts/e2e-suites.ts";

const FRAMEWORKS = {
    conformance: ["angular", "react", "vue"],
    examples: ["angular", "react", "vue"],
};
const ALL = {
    conformance: ["angular", "react", "vue"],
    examples: ["angular", "react", "vue"],
};
const NONE = { conformance: [], examples: [] };

// CI's `changes` job runs scripts/e2e-suites.ts against the pull request's base.
describe("the E2E suites a change runs", () => {
    it("runs none for the docs", () => {
        expect(
            e2eSuites(
                [
                    "site/docs/concepts/tree-shaking.mdx",
                    "AGENTS.md",
                    "docs/handoff.md",
                    "packages/primitives/README.md",
                    "examples/vue/README.md",
                ],
                FRAMEWORKS,
            ),
        ).toEqual(NONE);
    });

    it("runs only a framework's suites for its package, fixture or examples app", () => {
        expect(
            e2eSuites(
                ["packages/react/src/components/dialog/dialog-popup.tsx"],
                FRAMEWORKS,
            ),
        ).toEqual({ conformance: ["react"], examples: ["react"] });
        expect(
            e2eSuites(
                [
                    "fixtures/vue/src/scenarios/dialog/basic.vue",
                    "site/docs/index.mdx",
                ],
                FRAMEWORKS,
            ),
        ).toEqual({ conformance: ["vue"], examples: ["vue"] });
        expect(
            e2eSuites(
                [
                    "examples/angular/src/examples/dialog/index.ts",
                    "packages/vue/src/index.ts",
                ],
                FRAMEWORKS,
            ),
        ).toEqual({
            conformance: ["angular", "vue"],
            examples: ["angular", "vue"],
        });
    });

    it("runs every suite for anything else", () => {
        for (const path of [
            "packages/primitives/src/overlay/overlay-session.ts",
            "conformance/src/implementations.ts",
            "conformance/tests/dialog/behaviour.test.ts",
            "conformance/snapshots/dialog/dialog-basic-open.png",
            "examples/shared/e2e/smoke.spec.ts",
            "pnpm-lock.yaml",
            "package.json",
            "biome.json",
            ".github/workflows/ci.yml",
            "scripts/e2e-suites.ts",
            "site/export.ts",
            "packages/svelte/src/index.ts",
        ]) {
            expect(needOf(path, FRAMEWORKS), path).toBe("all");
            expect(
                e2eSuites(["packages/vue/src/index.ts", path], FRAMEWORKS),
                path,
            ).toEqual(ALL);
        }
    });

    it("runs none for no change", () => {
        expect(e2eSuites([], FRAMEWORKS)).toEqual(NONE);
    });

    it("finds the fixtures and examples apps the repository has", () => {
        const found = repositoryFrameworks();
        expect(found.conformance).toEqual(["angular", "react", "vue"]);
        expect(found.examples).toEqual(["angular", "react", "vue"]);
    });
});
