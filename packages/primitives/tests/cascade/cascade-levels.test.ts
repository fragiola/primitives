import { describe, expect, it } from "vitest";
import {
    type CascadeItem,
    cascadeLevels,
    cascadePathItems,
    hasCascadeChildren,
} from "../../src/cascade/cascade-levels.ts";

const TREE: readonly CascadeItem[] = [
    {
        value: "europe",
        label: "Europe",
        children: [
            {
                value: "france",
                label: "France",
                children: [{ value: "paris", label: "Paris" }],
            },
            { value: "malta", label: "Malta", children: [] },
        ],
    },
    { value: "antarctica", label: "Antarctica" },
];

describe("hasCascadeChildren", () => {
    it("is true for an item with children only", () => {
        expect(hasCascadeChildren(TREE[0])).toBe(true);
        expect(hasCascadeChildren(TREE[1])).toBe(false);
        expect(hasCascadeChildren(TREE[0]?.children?.[1])).toBe(false);
        expect(hasCascadeChildren(undefined)).toBe(false);
    });
});

describe("cascadeLevels", () => {
    it("opens the first level, then the children of each parent of the chain", () => {
        expect(cascadeLevels(TREE, [])).toEqual([TREE]);
        const levels = cascadeLevels(TREE, ["europe", "france"]);
        expect(levels.map((level) => level.map((item) => item.value))).toEqual([
            ["europe", "antarctica"],
            ["france", "malta"],
            ["paris"],
        ]);
    });

    it("stops at a leaf, an empty parent or a missing value", () => {
        expect(cascadeLevels(TREE, ["antarctica"])).toHaveLength(1);
        expect(cascadeLevels(TREE, ["europe", "malta"])).toHaveLength(2);
        expect(cascadeLevels(TREE, ["asia", "japan"])).toHaveLength(1);
        expect(
            cascadeLevels(TREE, ["europe", "france", "paris", "more"]),
        ).toHaveLength(3);
    });
});

describe("cascadePathItems", () => {
    it("resolves a path from the first level down", () => {
        expect(
            cascadePathItems(TREE, ["europe", "france", "paris"])?.map(
                (item) => item.label,
            ),
        ).toEqual(["Europe", "France", "Paris"]);
        expect(cascadePathItems(TREE, [])).toEqual([]);
    });

    it("is null for a path the tree does not hold", () => {
        expect(cascadePathItems(TREE, ["europe", "spain"])).toBeNull();
        expect(cascadePathItems(TREE, ["antarctica", "base"])).toBeNull();
    });
});
