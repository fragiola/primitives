import { describe, expect, it } from "vitest";
import {
    editTag,
    type TagRules,
    takeTags,
    typesDelimiter,
} from "../../src/form/tag-values.ts";

const rules: TagRules = {
    delimiter: ",",
    max: Infinity,
    allowDuplicates: false,
};

describe("takeTags", () => {
    it("adds every trimmed part of a whole text, dropping empty ones", () => {
        expect(takeTags(["a"], " b , c ,, ", rules, true)).toEqual({
            value: ["a", "b", "c"],
            added: ["b", "c"],
            refused: [],
            text: "",
        });
    });

    it("keeps the text after the last delimiter while typing, untrimmed", () => {
        expect(takeTags([], " solid , qw", rules, false)).toEqual({
            value: ["solid"],
            added: ["solid"],
            refused: [],
            text: " qw",
        });
        expect(takeTags([], "solid,", rules, false).text).toBe("");
    });

    it("refuses duplicates, also of a part added before it, unless allowed", () => {
        const taken = takeTags(["a"], "a,b,b", rules, true);
        expect(taken.value).toEqual(["a", "b"]);
        expect(taken.refused).toEqual([
            { text: "a", cause: "duplicate" },
            { text: "b", cause: "duplicate" },
        ]);
        expect(taken.text).toBe("a,b");
        expect(
            takeTags(["a"], "a", { ...rules, allowDuplicates: true }, true)
                .value,
        ).toEqual(["a", "a"]);
    });

    it("refuses past max, and what validate refuses, with the tags so far", () => {
        const seen: string[][] = [];
        const taken = takeTags(
            ["x@y"],
            "a@b; nope; c@d; e@f",
            {
                ...rules,
                delimiter: ";",
                max: 3,
                validate: (tag, value) => {
                    seen.push([...value]);
                    return tag.includes("@");
                },
            },
            true,
        );
        expect(taken.value).toEqual(["x@y", "a@b", "c@d"]);
        expect(taken.refused).toEqual([
            { text: "nope", cause: "invalid" },
            { text: "e@f", cause: "max" },
        ]);
        expect(taken.text).toBe("nope;e@f");
        expect(seen).toEqual([["x@y"], ["x@y", "a@b"], ["x@y", "a@b"]]);
    });

    it("keeps the refused texts before the typed one", () => {
        expect(takeTags(["a"], "a,b", rules, false)).toEqual({
            value: ["a"],
            added: [],
            refused: [{ text: "a", cause: "duplicate" }],
            text: "a,b",
        });
    });

    it("does not split without a delimiter", () => {
        const none = { ...rules, delimiter: null };
        expect(takeTags([], " a,b ", none, true).value).toEqual(["a,b"]);
        expect(takeTags([], "a", none, true).text).toBe("");
    });

    it("gives the same value back when nothing is added", () => {
        const value = ["a"];
        expect(takeTags(value, "  ", rules, true).value).toBe(value);
    });
});

describe("typesDelimiter", () => {
    it("is true when the input added a delimiter", () => {
        expect(typesDelimiter("svelte", "svelte,", ",")).toBe(true);
        expect(typesDelimiter("react,vue", "react,vue,", ",", ",")).toBe(true);
        expect(typesDelimiter("a;", "a;;", ";;")).toBe(true);
    });

    it("is true when the inserted text holds it, even with no more delimiters", () => {
        // the selection ",b" of "a,b" replaced by a typed ","
        expect(typesDelimiter("a,b", "a,", ",", ",")).toBe(true);
    });

    it("is false for any other input, though the text holds delimiters", () => {
        expect(typesDelimiter("react,vue", "react,vuex", ",", "x")).toBe(false);
        expect(typesDelimiter("react,vue", "react,vu", ",", null)).toBe(false);
        expect(typesDelimiter("react,vue", "react,vuex", ",")).toBe(false);
    });

    it("is false without a delimiter, or when the text holds none", () => {
        expect(typesDelimiter("a", "a,", null, ",")).toBe(false);
        expect(typesDelimiter("a", "a,", "", ",")).toBe(false);
        expect(typesDelimiter("a,", "a", ",", null)).toBe(false);
    });
});

describe("editTag", () => {
    const value = ["one", "two", "three"];

    it("replaces the tag with the trimmed text", () => {
        expect(editTag(value, 1, " deux ", rules)).toEqual({
            type: "replaced",
            value: ["one", "deux", "three"],
        });
    });

    it("changes nothing for the same text, and removes the tag for an empty one", () => {
        expect(editTag(value, 1, "two ", rules)).toEqual({ type: "unchanged" });
        expect(editTag(value, 1, "  ", rules)).toEqual({
            type: "removed",
            value: ["one", "three"],
        });
    });

    it("refuses a duplicate of another tag, and what validate refuses", () => {
        expect(editTag(value, 2, "one", rules)).toEqual({
            type: "refused",
            text: "one",
            cause: "duplicate",
        });
        expect(
            editTag(value, 2, "one", { ...rules, allowDuplicates: true }),
        ).toEqual({ type: "replaced", value: ["one", "two", "one"] });
        const others: string[][] = [];
        expect(
            editTag(value, 0, "uno", {
                ...rules,
                validate: (_, rest) => {
                    others.push([...rest]);
                    return false;
                },
            }),
        ).toEqual({ type: "refused", text: "uno", cause: "invalid" });
        expect(others).toEqual([["two", "three"]]);
    });
});
