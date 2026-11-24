import { describe, expect, it } from "vitest";
import { cascadeKeyAction } from "../../src/cascade/cascade-key-action.ts";

const key = (name: string, modifiers: Partial<KeyboardEvent> = {}) => ({
    key: name,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    ...modifiers,
});

describe("cascadeKeyAction", () => {
    it("maps the arrows, Home, End, Enter, Space and Escape", () => {
        expect(cascadeKeyAction(key("ArrowDown"), false)).toBe("next");
        expect(cascadeKeyAction(key("ArrowUp"), false)).toBe("previous");
        expect(cascadeKeyAction(key("Home"), false)).toBe("first");
        expect(cascadeKeyAction(key("End"), false)).toBe("last");
        expect(cascadeKeyAction(key("Enter"), false)).toBe("choose");
        expect(cascadeKeyAction(key(" "), false)).toBe("choose");
        expect(cascadeKeyAction(key("Escape"), false)).toBe("close");
        expect(cascadeKeyAction(key("a"), false)).toBeNull();
    });

    it("opens a level with the inline-end arrow and closes it with the inline-start one", () => {
        expect(cascadeKeyAction(key("ArrowRight"), false)).toBe("open-level");
        expect(cascadeKeyAction(key("ArrowLeft"), false)).toBe("close-level");
        expect(cascadeKeyAction(key("ArrowLeft"), true)).toBe("open-level");
        expect(cascadeKeyAction(key("ArrowRight"), true)).toBe("close-level");
    });

    it("leaves the keys with Alt, Ctrl or Meta alone", () => {
        expect(
            cascadeKeyAction(key("ArrowDown", { altKey: true }), false),
        ).toBeNull();
        expect(
            cascadeKeyAction(key("Enter", { ctrlKey: true }), false),
        ).toBeNull();
        expect(
            cascadeKeyAction(key("ArrowRight", { metaKey: true }), false),
        ).toBeNull();
    });
});
