import { describe, expect, it } from "vitest";
import { createListModel } from "../../src/selection/list-model.ts";
import {
    applySelection,
    inModelOrder,
    type SelectionState,
    sameSelection,
} from "../../src/selection/selection.ts";

// the toppings of spec/listbox.md, Olives disabled
const model = createListModel(
    [
        "cheese",
        "mushrooms",
        "olives",
        "onions",
        "peppers",
        "pineapple",
        "spinach",
        "tomatoes",
    ].map((key) => ({ key, textValue: key, disabled: key === "olives" })),
);
const empty: SelectionState = { selected: [], anchor: null };
const toggle = { mode: "multiple", behavior: "toggle" } as const;
const replace = { mode: "multiple", behavior: "replace" } as const;
const single = { mode: "single", behavior: "toggle" } as const;

describe("applySelection", () => {
    it("selects one option alone in single mode, and keeps the selected one", () => {
        const one = applySelection(
            model,
            empty,
            { type: "toggle", key: "onions" },
            single,
        );
        expect(one).toEqual({ selected: ["onions"], anchor: "onions" });
        expect(
            applySelection(
                model,
                one,
                { type: "toggle", key: "onions" },
                single,
            ),
        ).toBe(one);
        expect(
            applySelection(
                model,
                one,
                { type: "range", key: "spinach" },
                single,
            ).selected,
        ).toEqual(["spinach"]);
        expect(applySelection(model, one, { type: "all" }, single)).toBe(one);
    });

    it("changes nothing in none mode", () => {
        expect(
            applySelection(
                model,
                empty,
                { type: "toggle", key: "cheese" },
                { mode: "none", behavior: "toggle" },
            ),
        ).toBe(empty);
    });

    it("never selects a disabled option", () => {
        expect(
            applySelection(
                model,
                empty,
                { type: "toggle", key: "olives" },
                toggle,
            ),
        ).toBe(empty);
        expect(
            applySelection(
                model,
                empty,
                { type: "replace", key: "olives" },
                single,
            ),
        ).toBe(empty);
    });

    it("toggles in the list's order and moves the anchor", () => {
        let state = applySelection(
            model,
            empty,
            { type: "toggle", key: "spinach" },
            toggle,
        );
        state = applySelection(
            model,
            state,
            { type: "toggle", key: "cheese" },
            toggle,
        );
        expect(state).toEqual({
            selected: ["cheese", "spinach"],
            anchor: "cheese",
        });
        state = applySelection(
            model,
            state,
            { type: "toggle", key: "spinach" },
            toggle,
        );
        expect(state).toEqual({ selected: ["cheese"], anchor: "spinach" });
    });

    it("replaces the selection with one option", () => {
        expect(
            applySelection(
                model,
                { selected: ["cheese", "onions"], anchor: "cheese" },
                { type: "replace", key: "peppers" },
                replace,
            ),
        ).toEqual({ selected: ["peppers"], anchor: "peppers" });
    });

    it("adds a range from the anchor in the toggle model, passing over disabled options", () => {
        expect(
            applySelection(
                model,
                { selected: ["tomatoes"], anchor: "mushrooms" },
                { type: "range", key: "peppers" },
                toggle,
            ),
        ).toEqual({
            selected: ["mushrooms", "onions", "peppers", "tomatoes"],
            anchor: "mushrooms",
        });
    });

    it("replaces the selection with the range in the replace model", () => {
        expect(
            applySelection(
                model,
                { selected: ["cheese", "tomatoes"], anchor: "peppers" },
                { type: "range", key: "onions" },
                replace,
            ),
        ).toEqual({ selected: ["onions", "peppers"], anchor: "peppers" });
    });

    it("takes a range from the given key (Ctrl+Shift+Home), which becomes the anchor", () => {
        expect(
            applySelection(
                model,
                empty,
                { type: "range", key: "cheese", from: "onions" },
                toggle,
            ),
        ).toEqual({
            selected: ["cheese", "mushrooms", "onions"],
            anchor: "onions",
        });
    });

    it("starts a range with no anchor at its own option", () => {
        expect(
            applySelection(
                model,
                empty,
                { type: "range", key: "spinach" },
                toggle,
            ),
        ).toEqual({ selected: ["spinach"], anchor: "spinach" });
    });

    it("selects all, then none, keeping a disabled option a controlled value selected", () => {
        const all = applySelection(model, empty, { type: "all" }, toggle);
        expect(all.selected).toEqual([
            "cheese",
            "mushrooms",
            "onions",
            "peppers",
            "pineapple",
            "spinach",
            "tomatoes",
        ]);
        expect(
            applySelection(model, all, { type: "all" }, toggle).selected,
        ).toEqual([]);
        const withDisabled = { selected: ["olives"], anchor: null };
        expect(
            applySelection(model, withDisabled, { type: "all" }, toggle)
                .selected,
        ).toContain("olives");
    });
});

describe("inModelOrder", () => {
    it("orders known keys by the model and keeps unknown ones at the end", () => {
        expect(
            inModelOrder(model, ["zz", "tomatoes", "cheese", "cheese", "aa"]),
        ).toEqual(["cheese", "tomatoes", "zz", "aa"]);
    });
});

describe("sameSelection", () => {
    it("compares keys in order", () => {
        expect(sameSelection(["a", "b"], ["a", "b"])).toBe(true);
        expect(sameSelection(["a", "b"], ["b", "a"])).toBe(false);
        expect(sameSelection(["a"], ["a", "b"])).toBe(false);
    });
});
