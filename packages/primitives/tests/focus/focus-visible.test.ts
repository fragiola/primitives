import { describe, expect, it } from "vitest";
import { isKeyboardModality } from "../../src/focus/focus-visible.ts";

describe("isKeyboardModality", () => {
    it("tracks each document on its own", () => {
        const first = document.implementation.createHTMLDocument("first");
        const second = document.implementation.createHTMLDocument("second");
        expect(isKeyboardModality(first)).toBe(false);
        expect(isKeyboardModality(second)).toBe(false);
        first.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
        expect(isKeyboardModality(first)).toBe(true);
        expect(isKeyboardModality(second)).toBe(false);
        second.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
        first.dispatchEvent(new Event("pointerdown"));
        expect(isKeyboardModality(first)).toBe(false);
        expect(isKeyboardModality(second)).toBe(true);
    });
});
