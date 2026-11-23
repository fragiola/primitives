import { describe, expect, it } from "vitest";
import { createTypeahead } from "../../src/collection/typeahead.ts";
import {
    type ListKeyOptions,
    listKeyTarget,
    listPressSelection,
} from "../../src/selection/list-keys.ts";
import { createListModel } from "../../src/selection/list-model.ts";

const model = createListModel(
    ["apple", "banana", "blueberry", "cherry", "orange"].map((key) => ({
        key,
        textValue: key[0]?.toUpperCase() + key.slice(1),
        disabled: key === "orange",
    })),
);
const base: ListKeyOptions = {
    orientation: "vertical",
    rtl: false,
    loop: true,
    mode: "multiple",
    behavior: "toggle",
};
const key = (
    name: string,
    modifiers: Partial<{
        shiftKey: boolean;
        ctrlKey: boolean;
        metaKey: boolean;
        altKey: boolean;
    }> = {},
) => ({
    key: name,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...modifiers,
});

describe("listKeyTarget: focus moves", () => {
    it("moves along the orientation, wrapping with loop, and selects nothing in the toggle model", () => {
        expect(listKeyTarget(key("ArrowDown"), model, 0, base)).toEqual({
            index: 1,
            selection: null,
        });
        expect(listKeyTarget(key("ArrowUp"), model, 0, base)?.index).toBe(4);
        expect(
            listKeyTarget(key("ArrowUp"), model, 0, { ...base, loop: false })
                ?.index,
        ).toBe(0);
        expect(listKeyTarget(key("End"), model, 0, base)?.index).toBe(4);
        expect(listKeyTarget(key("Home"), model, 3, base)?.index).toBe(0);
        expect(listKeyTarget(key("ArrowRight"), model, 0, base)).toBeNull();
    });

    it("moves with the horizontal arrows, swapped in RTL", () => {
        const horizontal = { ...base, orientation: "horizontal" as const };
        expect(
            listKeyTarget(key("ArrowRight"), model, 1, horizontal)?.index,
        ).toBe(2);
        expect(
            listKeyTarget(key("ArrowLeft"), model, 1, {
                ...horizontal,
                rtl: true,
            })?.index,
        ).toBe(2);
        expect(
            listKeyTarget(key("ArrowDown"), model, 1, horizontal),
        ).toBeNull();
    });

    it("pages with the measure it is given, else to the ends", () => {
        expect(listKeyTarget(key("PageDown"), model, 1, base)?.index).toBe(4);
        expect(listKeyTarget(key("PageUp"), model, 3, base)?.index).toBe(0);
        expect(
            listKeyTarget(key("PageDown"), model, 1, {
                ...base,
                page: (index, delta) => index + delta * 2,
            })?.index,
        ).toBe(3);
    });

    it("leaves Alt, Tab and an empty list alone", () => {
        expect(
            listKeyTarget(key("ArrowDown", { altKey: true }), model, 0, base),
        ).toBeNull();
        expect(listKeyTarget(key("Tab"), model, 0, base)).toBeNull();
        expect(
            listKeyTarget(key("ArrowDown"), createListModel([]), -1, base),
        ).toBeNull();
    });

    it("moves by typeahead, and selects in the replace model", () => {
        const typeahead = createTypeahead();
        const options = {
            ...base,
            typeahead: (character: string, index: number) =>
                typeahead.match(character, model.labels, index, 0),
        };
        expect(listKeyTarget(key("c"), model, 0, options)).toEqual({
            index: 3,
            selection: null,
        });
        typeahead.reset();
        expect(
            listKeyTarget(key("b"), model, 0, {
                ...options,
                behavior: "replace",
            }),
        ).toEqual({ index: 1, selection: { type: "replace", key: "banana" } });
        typeahead.reset();
        expect(listKeyTarget(key("z"), model, 0, options)).toBeNull();
    });
});

describe("listKeyTarget: the toggle model (multiple)", () => {
    it("toggles with Space and Enter", () => {
        expect(listKeyTarget(key(" "), model, 2, base)?.selection).toEqual({
            type: "toggle",
            key: "blueberry",
        });
        expect(listKeyTarget(key("Enter"), model, 2, base)?.selection).toEqual({
            type: "toggle",
            key: "blueberry",
        });
    });

    it("moves and toggles with Shift and an arrow", () => {
        expect(
            listKeyTarget(key("ArrowDown", { shiftKey: true }), model, 1, base),
        ).toEqual({
            index: 2,
            selection: { type: "toggle", key: "blueberry" },
        });
        expect(
            listKeyTarget(key("ArrowUp", { shiftKey: true }), model, 0, {
                ...base,
                loop: false,
            }),
        ).toEqual({ index: 0, selection: null });
    });

    it("selects the range from the anchor with Shift and Space", () => {
        expect(
            listKeyTarget(key(" ", { shiftKey: true }), model, 3, base)
                ?.selection,
        ).toEqual({ type: "range", key: "cherry" });
    });

    it("selects to an end from the focused option with Ctrl, Shift and Home or End", () => {
        expect(
            listKeyTarget(
                key("End", { ctrlKey: true, shiftKey: true }),
                model,
                1,
                base,
            ),
        ).toEqual({
            index: 4,
            selection: { type: "range", key: "orange", from: "banana" },
        });
        expect(
            listKeyTarget(
                key("Home", { metaKey: true, shiftKey: true }),
                model,
                2,
                base,
            ),
        ).toEqual({
            index: 0,
            selection: { type: "range", key: "apple", from: "blueberry" },
        });
    });

    it("selects all with Ctrl or Meta and A", () => {
        expect(
            listKeyTarget(key("a", { ctrlKey: true }), model, 0, base)
                ?.selection,
        ).toEqual({ type: "all" });
        expect(
            listKeyTarget(key("A", { metaKey: true }), model, 0, base)
                ?.selection,
        ).toEqual({ type: "all" });
        expect(
            listKeyTarget(key("a", { ctrlKey: true }), model, 0, {
                ...base,
                mode: "single",
            }),
        ).toBeNull();
    });
});

describe("listKeyTarget: the replace model (multiple)", () => {
    const replace = { ...base, behavior: "replace" as const };

    it("selects the option a move lands on, unless Ctrl is held", () => {
        expect(listKeyTarget(key("ArrowDown"), model, 0, replace)).toEqual({
            index: 1,
            selection: { type: "replace", key: "banana" },
        });
        expect(
            listKeyTarget(
                key("ArrowDown", { ctrlKey: true }),
                model,
                0,
                replace,
            ),
        ).toEqual({ index: 1, selection: null });
    });

    it("replaces with Space, toggles with Ctrl and Space", () => {
        expect(listKeyTarget(key(" "), model, 1, replace)?.selection).toEqual({
            type: "replace",
            key: "banana",
        });
        expect(
            listKeyTarget(key(" ", { ctrlKey: true }), model, 1, replace)
                ?.selection,
        ).toEqual({ type: "toggle", key: "banana" });
    });
});

describe("listKeyTarget: single", () => {
    const single = { ...base, mode: "single" as const };

    it("selects with Space and Enter, Shift changing nothing", () => {
        expect(listKeyTarget(key(" "), model, 1, single)?.selection).toEqual({
            type: "replace",
            key: "banana",
        });
        expect(
            listKeyTarget(
                key("ArrowDown", { shiftKey: true }),
                model,
                1,
                single,
            ),
        ).toEqual({ index: 2, selection: null });
    });

    it("follows the focus in the replace model", () => {
        expect(
            listKeyTarget(key("End"), model, 0, {
                ...single,
                behavior: "replace",
            }),
        ).toEqual({ index: 4, selection: { type: "replace", key: "orange" } });
    });
});

describe("listPressSelection", () => {
    const press = { shiftKey: false, ctrlKey: false, metaKey: false };
    it("toggles, replaces or selects a range by the model and the modifiers", () => {
        expect(
            listPressSelection("a", press, {
                mode: "multiple",
                behavior: "toggle",
            }),
        ).toEqual({ type: "toggle", key: "a" });
        expect(
            listPressSelection("a", press, {
                mode: "multiple",
                behavior: "replace",
            }),
        ).toEqual({ type: "replace", key: "a" });
        expect(
            listPressSelection(
                "a",
                { ...press, metaKey: true },
                { mode: "multiple", behavior: "replace" },
            ),
        ).toEqual({ type: "toggle", key: "a" });
        expect(
            listPressSelection(
                "a",
                { ...press, shiftKey: true },
                { mode: "multiple", behavior: "replace" },
            ),
        ).toEqual({ type: "range", key: "a" });
        expect(
            listPressSelection("a", press, {
                mode: "single",
                behavior: "toggle",
            }),
        ).toEqual({ type: "replace", key: "a" });
        expect(
            listPressSelection("a", press, {
                mode: "none",
                behavior: "toggle",
            }),
        ).toBeNull();
    });
});
