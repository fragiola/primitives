import { describe, expect, it } from "vitest";
import { selectedFrameworks } from "../../scripts/dev-fixtures.ts";

const ALL = ["react", "vue", "angular"];

describe("pnpm dev", () => {
    it("starts every fixture, or the ones --framework names", () => {
        expect(selectedFrameworks([], ALL)).toEqual(ALL);
        expect(selectedFrameworks(["--framework", "vue,angular"], ALL)).toEqual(
            ["vue", "angular"],
        );
        expect(selectedFrameworks(["--framework=react"], ALL)).toEqual([
            "react",
        ]);
    });

    it("refuses an unknown framework", () => {
        expect(() =>
            selectedFrameworks(["--framework", "svelte"], ALL),
        ).toThrow(/unknown framework: svelte/);
    });
});
