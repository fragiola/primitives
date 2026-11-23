import { describe, expect, it } from "vitest";
import { createListModel } from "../../src/selection/list-model.ts";

describe("createListModel", () => {
    const model = createListModel([
        { key: "a", textValue: "Apple" },
        { key: "b", textValue: "Banana", disabled: true },
        { key: "c", textValue: "Cherry" },
        { key: "a", textValue: "Again" },
    ]);

    it("keeps the options in order, a repeated key in its first place", () => {
        expect(model.size).toBe(3);
        expect(model.nodes.map((node) => node.key)).toEqual(["a", "b", "c"]);
        expect(model.labels).toEqual(["Apple", "Banana", "Cherry"]);
    });

    it("indexes the keys and knows the disabled ones", () => {
        expect(model.indexOf("c")).toBe(2);
        expect(model.indexOf("z")).toBe(-1);
        expect(model.indexOf(null)).toBe(-1);
        expect(model.isDisabled("b")).toBe(true);
        expect(model.isDisabled("a")).toBe(false);
        expect(model.isDisabled("z")).toBe(false);
        expect(model.enabledKeys).toEqual(["a", "c"]);
    });
});
