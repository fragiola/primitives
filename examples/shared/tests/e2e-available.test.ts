import { describe, expect, it } from "vitest";
import { embedBase, frameworkOf, missingReason } from "../e2e/available.ts";

// The shared e2e suite's framework and examples (e2e/available.ts), free of Playwright.

describe("the e2e run", () => {
    it("tests the framework its config names, and nothing else", () => {
        expect(frameworkOf("vue")).toBe("vue");
        expect(() => frameworkOf(undefined)).toThrow(/EXAMPLES_FRAMEWORK/);
        expect(() => frameworkOf("svelte")).toThrow(/svelte/);
    });

    it("mounts each embed where site:export --base /primitives puts it", () => {
        expect(embedBase("angular")).toBe("/primitives/embed/angular/");
    });

    it("names the examples a framework lacks", () => {
        expect(missingReason("react", ["dialog", "tabs"], ["dialog"])).toBe(
            undefined,
        );
        expect(missingReason("vue", ["dialog"], ["dialog", "tabs"])).toBe(
            "vue has no tabs example",
        );
    });
});
