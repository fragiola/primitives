import { describe, expect, it } from "vitest";
import {
    removalFocusIndex,
    type TagKeyEvent,
    tagGroupKeyTarget,
    tagsInputInputKeyTarget,
    tagsInputTagKeyTarget,
} from "../../src/collection/tag-keys.ts";

const key = (name: string, modifiers: Partial<TagKeyEvent> = {}) => ({
    key: name,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...modifiers,
});

describe("tagGroupKeyTarget", () => {
    const options = {
        rtl: false,
        loop: true,
        selectable: true,
        removable: true,
    };

    it("moves to the next and previous tag with both arrows of each axis, wrapping", () => {
        expect(tagGroupKeyTarget(key("ArrowRight"), 1, 5, options)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("ArrowDown"), 1, 5, options)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("ArrowLeft"), 1, 5, options)).toEqual({
            type: "focus",
            index: 0,
        });
        expect(tagGroupKeyTarget(key("ArrowUp"), 1, 5, options)).toEqual({
            type: "focus",
            index: 0,
        });
        expect(tagGroupKeyTarget(key("ArrowLeft"), 0, 5, options)).toEqual({
            type: "focus",
            index: 4,
        });
        expect(tagGroupKeyTarget(key("ArrowDown"), 4, 5, options)).toEqual({
            type: "focus",
            index: 0,
        });
    });

    it("stops at the ends without loop", () => {
        const stop = { ...options, loop: false };
        expect(tagGroupKeyTarget(key("ArrowRight"), 4, 5, stop)).toEqual({
            type: "focus",
            index: 4,
        });
        expect(tagGroupKeyTarget(key("ArrowUp"), 0, 5, stop)).toEqual({
            type: "focus",
            index: 0,
        });
    });

    it("swaps ArrowLeft and ArrowRight in RTL, not ArrowUp and ArrowDown", () => {
        const rtl = { ...options, rtl: true };
        expect(tagGroupKeyTarget(key("ArrowLeft"), 1, 5, rtl)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("ArrowRight"), 1, 5, rtl)).toEqual({
            type: "focus",
            index: 0,
        });
        expect(tagGroupKeyTarget(key("ArrowDown"), 1, 5, rtl)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("ArrowUp"), 1, 5, rtl)).toEqual({
            type: "focus",
            index: 0,
        });
    });

    it("passes over skipped tags, Home and End included", () => {
        const skip = { ...options, skip: (index: number) => index % 2 === 1 };
        expect(tagGroupKeyTarget(key("ArrowRight"), 0, 5, skip)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("ArrowUp"), 0, 5, skip)).toEqual({
            type: "focus",
            index: 4,
        });
        const last = { ...options, skip: (index: number) => index >= 3 };
        expect(tagGroupKeyTarget(key("End"), 0, 5, last)).toEqual({
            type: "focus",
            index: 2,
        });
        expect(tagGroupKeyTarget(key("Home"), 2, 5, skip)).toEqual({
            type: "focus",
            index: 0,
        });
    });

    it("selects with Space and Enter, removes with Delete and Backspace, when allowed", () => {
        for (const name of [" ", "Enter"]) {
            expect(tagGroupKeyTarget(key(name), 0, 3, options)).toEqual({
                type: "select",
            });
            expect(
                tagGroupKeyTarget(key(name), 0, 3, {
                    ...options,
                    selectable: false,
                }),
            ).toBeNull();
        }
        for (const name of ["Delete", "Backspace"]) {
            expect(tagGroupKeyTarget(key(name), 0, 3, options)).toEqual({
                type: "remove",
            });
            expect(
                tagGroupKeyTarget(key(name), 0, 3, {
                    ...options,
                    removable: false,
                }),
            ).toBeNull();
        }
    });

    it("leaves keys with a modifier, and other keys, alone", () => {
        for (const modifier of [
            "shiftKey",
            "ctrlKey",
            "metaKey",
            "altKey",
        ] as const) {
            expect(
                tagGroupKeyTarget(
                    key("ArrowRight", { [modifier]: true }),
                    0,
                    3,
                    options,
                ),
            ).toBeNull();
        }
        expect(tagGroupKeyTarget(key("Tab"), 0, 3, options)).toBeNull();
        expect(tagGroupKeyTarget(key("a"), 0, 3, options)).toBeNull();
    });
});

describe("removalFocusIndex", () => {
    it("is the next item, else the previous one, else none", () => {
        expect(removalFocusIndex(5, 1)).toBe(2);
        expect(removalFocusIndex(5, 4)).toBe(3);
        expect(removalFocusIndex(1, 0)).toBe(-1);
    });

    it("passes over skipped items", () => {
        const skip = (index: number) => index === 2 || index === 4;
        expect(removalFocusIndex(5, 1, skip)).toBe(3);
        expect(removalFocusIndex(5, 3, skip)).toBe(1);
        expect(removalFocusIndex(3, 1, (index) => index !== 1)).toBe(-1);
    });
});

describe("tagsInputInputKeyTarget", () => {
    const start = { selectionStart: 0, selectionEnd: 0 };
    const end = { selectionStart: 3, selectionEnd: 3 };

    it("adds with Enter, wherever the caret is", () => {
        expect(tagsInputInputKeyTarget(key("Enter"), end, 2, false)).toEqual({
            type: "add",
        });
        expect(tagsInputInputKeyTarget(key("Enter"), start, 0, false)).toEqual({
            type: "add",
        });
    });

    it("focuses the last tag with Backspace or the previous arrow at the start", () => {
        expect(
            tagsInputInputKeyTarget(key("Backspace"), start, 3, false),
        ).toEqual({ type: "focus-tag", index: 2 });
        expect(
            tagsInputInputKeyTarget(key("ArrowLeft"), start, 3, false),
        ).toEqual({ type: "focus-tag", index: 2 });
        expect(
            tagsInputInputKeyTarget(key("ArrowRight"), start, 3, true),
        ).toEqual({ type: "focus-tag", index: 2 });
        expect(
            tagsInputInputKeyTarget(key("ArrowRight"), start, 3, false),
        ).toBeNull();
    });

    it("leaves the caret's keys to the input away from the start, with a selection or no tag", () => {
        expect(
            tagsInputInputKeyTarget(key("Backspace"), end, 3, false),
        ).toBeNull();
        expect(
            tagsInputInputKeyTarget(
                key("Backspace"),
                { selectionStart: 0, selectionEnd: 2 },
                3,
                false,
            ),
        ).toBeNull();
        expect(
            tagsInputInputKeyTarget(key("Backspace"), start, 0, false),
        ).toBeNull();
        expect(
            tagsInputInputKeyTarget(
                key("ArrowLeft", { shiftKey: true }),
                start,
                3,
                false,
            ),
        ).toBeNull();
        expect(
            tagsInputInputKeyTarget(
                key("Enter", { ctrlKey: true }),
                end,
                3,
                false,
            ),
        ).toBeNull();
    });
});

describe("tagsInputTagKeyTarget", () => {
    const options = { rtl: false, editable: false };

    it("moves to the previous tag (none on the first) and the next one, then the Input", () => {
        expect(tagsInputTagKeyTarget(key("ArrowLeft"), 1, 3, options)).toEqual({
            type: "focus",
            target: 0,
        });
        expect(
            tagsInputTagKeyTarget(key("ArrowLeft"), 0, 3, options),
        ).toBeNull();
        expect(tagsInputTagKeyTarget(key("ArrowRight"), 1, 3, options)).toEqual(
            { type: "focus", target: 2 },
        );
        expect(tagsInputTagKeyTarget(key("ArrowRight"), 2, 3, options)).toEqual(
            { type: "focus", target: "input" },
        );
        expect(
            tagsInputTagKeyTarget(key("ArrowLeft"), 1, 3, {
                ...options,
                rtl: true,
            }),
        ).toEqual({ type: "focus", target: 2 });
    });

    it("removes with Backspace toward the start, with Delete toward the end", () => {
        expect(tagsInputTagKeyTarget(key("Backspace"), 2, 3, options)).toEqual({
            type: "remove",
            focus: 1,
        });
        expect(tagsInputTagKeyTarget(key("Backspace"), 0, 3, options)).toEqual({
            type: "remove",
            focus: 0,
        });
        expect(tagsInputTagKeyTarget(key("Backspace"), 0, 1, options)).toEqual({
            type: "remove",
            focus: "input",
        });
        expect(tagsInputTagKeyTarget(key("Delete"), 0, 3, options)).toEqual({
            type: "remove",
            focus: 0,
        });
        expect(tagsInputTagKeyTarget(key("Delete"), 2, 3, options)).toEqual({
            type: "remove",
            focus: 1,
        });
        expect(tagsInputTagKeyTarget(key("Delete"), 0, 1, options)).toEqual({
            type: "remove",
            focus: "input",
        });
    });

    it("edits with Enter when editable; Escape and characters go to the Input", () => {
        expect(tagsInputTagKeyTarget(key("Enter"), 0, 2, options)).toBeNull();
        expect(
            tagsInputTagKeyTarget(key("Enter"), 0, 2, {
                ...options,
                editable: true,
            }),
        ).toEqual({ type: "edit" });
        expect(tagsInputTagKeyTarget(key("Escape"), 0, 2, options)).toEqual({
            type: "focus",
            target: "input",
        });
        expect(tagsInputTagKeyTarget(key("x"), 0, 2, options)).toEqual({
            type: "type",
        });
        expect(tagsInputTagKeyTarget(key("Tab"), 0, 2, options)).toBeNull();
        expect(
            tagsInputTagKeyTarget(key("x", { ctrlKey: true }), 0, 2, options),
        ).toBeNull();
    });
});
