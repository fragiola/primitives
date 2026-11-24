import { describe, expect, it } from "vitest";
import { commandKeyTarget } from "../../src/command/command-key-target.ts";

const key = (name: string, modifiers: Partial<KeyboardEvent> = {}) => ({
    key: name,
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    ...modifiers,
});

describe("commandKeyTarget", () => {
    it("moves with the arrows, wrapping with loop", () => {
        expect(commandKeyTarget(key("ArrowDown"), 0, 3)).toBe(1);
        expect(commandKeyTarget(key("ArrowDown"), 2, 3)).toBe(0);
        expect(commandKeyTarget(key("ArrowUp"), 0, 3)).toBe(2);
        expect(commandKeyTarget(key("ArrowDown"), -1, 3)).toBe(0);
        expect(commandKeyTarget(key("ArrowUp"), -1, 3)).toBe(2);
        expect(commandKeyTarget(key("ArrowDown"), 2, 3, false)).toBe(2);
        expect(commandKeyTarget(key("ArrowUp"), 0, 3, false)).toBe(0);
    });

    it("goes to the ends with Home and End", () => {
        expect(commandKeyTarget(key("Home"), 2, 3)).toBe(0);
        expect(commandKeyTarget(key("End"), 0, 3)).toBe(2);
        expect(commandKeyTarget(key("Home"), -1, 0)).toBe(-1);
        expect(commandKeyTarget(key("End"), -1, 0)).toBe(-1);
    });

    it("leaves the other keys and the modified ones native", () => {
        expect(commandKeyTarget(key("Enter"), 0, 3)).toBeNull();
        expect(
            commandKeyTarget(key("Home", { shiftKey: true }), 1, 3),
        ).toBeNull();
        expect(
            commandKeyTarget(key("End", { shiftKey: true }), 1, 3),
        ).toBeNull();
        expect(
            commandKeyTarget(key("ArrowDown", { altKey: true }), 1, 3),
        ).toBeNull();
        expect(
            commandKeyTarget(key("ArrowDown", { ctrlKey: true }), 1, 3),
        ).toBeNull();
        expect(
            commandKeyTarget(key("ArrowDown", { metaKey: true }), 1, 3),
        ).toBeNull();
        expect(commandKeyTarget(key("ArrowDown"), -1, 0)).toBe(-1);
    });
});
