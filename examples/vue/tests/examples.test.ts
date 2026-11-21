import { exampleProblems } from "examples-shared/scripts/example-rules";
import { examplesApp } from "examples-shared/scripts/examples-lib";
import { describe, expect, it } from "vitest";

// The Vue side of the example contract (examples-shared/scripts/example-rules.ts): every
// example imports only what a consumer can copy (Vue, the component's entry of
// @fragiola/primitives-vue, its relative files and the recipes), and reads its classes from its
// styles.ts, never from strings in its markup.

describe("the Vue examples", () => {
    it("are copyable, and styled from their styles.ts", () => {
        expect(exampleProblems(examplesApp("vue"))).toEqual([]);
    });
});
