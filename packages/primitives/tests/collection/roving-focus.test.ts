import { describe, expect, it } from "vitest";
import {
    inDocumentOrder,
    rovingKeys,
    rovingKeyTarget,
    rovingTabStop,
    textFieldKeepsKey,
} from "../../src/collection/roving-focus.ts";

describe("rovingKeys", () => {
    it("are the orientation's arrows, mirrored in RTL when horizontal", () => {
        expect(rovingKeys("horizontal", false)).toEqual({
            next: "ArrowRight",
            previous: "ArrowLeft",
        });
        expect(rovingKeys("horizontal", true)).toEqual({
            next: "ArrowLeft",
            previous: "ArrowRight",
        });
        expect(rovingKeys("vertical", true)).toEqual({
            next: "ArrowDown",
            previous: "ArrowUp",
        });
    });
});

describe("rovingKeyTarget", () => {
    const horizontal = {
        orientation: "horizontal" as const,
        rtl: false,
        loop: true,
    };

    it("moves along the orientation and wraps with loop", () => {
        expect(rovingKeyTarget("ArrowRight", 0, 4, horizontal)).toBe(1);
        expect(rovingKeyTarget("ArrowRight", 3, 4, horizontal)).toBe(0);
        expect(rovingKeyTarget("ArrowLeft", 0, 4, horizontal)).toBe(3);
        // the other orientation's arrows are no key of the composite
        expect(rovingKeyTarget("ArrowDown", 0, 4, horizontal)).toBeNull();
        expect(rovingKeyTarget("Enter", 0, 4, horizontal)).toBeNull();
    });

    it("mirrors the horizontal arrows in RTL; the vertical ones never", () => {
        const rtl = { ...horizontal, rtl: true };
        expect(rovingKeyTarget("ArrowLeft", 0, 4, rtl)).toBe(1);
        expect(rovingKeyTarget("ArrowRight", 0, 4, rtl)).toBe(3);
        const vertical = { ...rtl, orientation: "vertical" as const };
        expect(rovingKeyTarget("ArrowDown", 0, 4, vertical)).toBe(1);
        expect(rovingKeyTarget("ArrowUp", 1, 4, vertical)).toBe(0);
        expect(rovingKeyTarget("ArrowLeft", 0, 4, vertical)).toBeNull();
    });

    it("stops at the ends without loop", () => {
        const noLoop = { ...horizontal, loop: false };
        expect(rovingKeyTarget("ArrowRight", 3, 4, noLoop)).toBe(3);
        expect(rovingKeyTarget("ArrowLeft", 0, 4, noLoop)).toBe(0);
    });

    it("passes over skipped items, for the arrows, Home and End", () => {
        const skip = (index: number) => index === 0 || index === 2;
        const options = { ...horizontal, skip };
        expect(rovingKeyTarget("ArrowRight", 1, 4, options)).toBe(3);
        expect(rovingKeyTarget("ArrowRight", 3, 4, options)).toBe(1);
        expect(rovingKeyTarget("Home", 3, 4, options)).toBe(1);
        expect(
            rovingKeyTarget("End", 1, 4, {
                ...options,
                skip: (index) => index === 3,
            }),
        ).toBe(2);
        // without loop, the last item that can take focus stays
        expect(
            rovingKeyTarget("ArrowRight", 1, 4, {
                ...options,
                loop: false,
                skip: (index) => index > 1,
            }),
        ).toBe(1);
    });

    it("enters from no item, and gives nothing when every item is skipped", () => {
        expect(rovingKeyTarget("ArrowRight", -1, 3, horizontal)).toBe(0);
        expect(rovingKeyTarget("ArrowLeft", -1, 3, horizontal)).toBe(2);
        const none = { ...horizontal, skip: () => true };
        expect(rovingKeyTarget("ArrowRight", 0, 3, none)).toBeNull();
        expect(rovingKeyTarget("Home", 0, 3, none)).toBeNull();
        expect(rovingKeyTarget("End", 0, 0, horizontal)).toBeNull();
    });
});

describe("rovingTabStop", () => {
    it("is the preferred item while it can take focus, else the first that can", () => {
        expect(rovingTabStop(4, 2)).toBe(2);
        expect(rovingTabStop(4, -1)).toBe(0);
        expect(rovingTabStop(4, 7)).toBe(0);
        expect(rovingTabStop(4, 2, (index) => index === 2)).toBe(0);
        expect(rovingTabStop(4, -1, (index) => index < 2)).toBe(2);
        expect(rovingTabStop(4, 1, () => true)).toBe(-1);
        expect(rovingTabStop(0, 0)).toBe(-1);
    });
});

describe("textFieldKeepsKey", () => {
    const keys = { next: "ArrowRight", previous: "ArrowLeft" };

    function field(value: string, start: number, end = start) {
        const input = document.createElement("input");
        input.value = value;
        document.body.append(input);
        input.setSelectionRange(start, end);
        return input;
    }

    it("keeps the arrows while the caret can still move that way", () => {
        const input = field("draft", 2);
        expect(textFieldKeepsKey(input, "ArrowRight", keys)).toBe(true);
        expect(textFieldKeepsKey(input, "ArrowLeft", keys)).toBe(true);
        const atEnd = field("draft", 5);
        expect(textFieldKeepsKey(atEnd, "ArrowRight", keys)).toBe(false);
        expect(textFieldKeepsKey(atEnd, "ArrowLeft", keys)).toBe(true);
        const atStart = field("draft", 0);
        expect(textFieldKeepsKey(atStart, "ArrowLeft", keys)).toBe(false);
        expect(textFieldKeepsKey(atStart, "ArrowRight", keys)).toBe(true);
    });

    it("keeps every key while text is selected, Home and End unless it is empty", () => {
        const selected = field("draft", 0, 5);
        expect(textFieldKeepsKey(selected, "ArrowRight", keys)).toBe(true);
        expect(textFieldKeepsKey(selected, "ArrowLeft", keys)).toBe(true);
        expect(textFieldKeepsKey(field("draft", 5), "Home", keys)).toBe(true);
        expect(textFieldKeepsKey(field("draft", 0), "End", keys)).toBe(true);
        expect(textFieldKeepsKey(field("", 0), "Home", keys)).toBe(false);
        expect(textFieldKeepsKey(field("", 0), "ArrowRight", keys)).toBe(false);
    });

    it("keeps nothing for another element, a disabled field or another key", () => {
        const button = document.createElement("button");
        expect(textFieldKeepsKey(button, "ArrowRight", keys)).toBe(false);
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        expect(textFieldKeepsKey(checkbox, "ArrowRight", keys)).toBe(false);
        const disabled = field("draft", 2);
        disabled.setAttribute("aria-disabled", "true");
        expect(textFieldKeepsKey(disabled, "ArrowRight", keys)).toBe(false);
        expect(textFieldKeepsKey(field("draft", 2), "ArrowDown", keys)).toBe(
            false,
        );
        const area = document.createElement("textarea");
        area.value = "notes";
        document.body.append(area);
        area.setSelectionRange(1, 1);
        expect(textFieldKeepsKey(area, "ArrowLeft", keys)).toBe(true);
    });
});

describe("inDocumentOrder", () => {
    it("sorts entries by their elements' position in the document", () => {
        const root = document.createElement("div");
        const [a, b, c] = ["a", "b", "c"].map((id) => {
            const element = document.createElement("span");
            element.id = id;
            return element;
        }) as [HTMLElement, HTMLElement, HTMLElement];
        const group = document.createElement("div");
        group.append(b);
        root.append(a, group, c);
        const entries = [{ element: c }, { element: a }, { element: b }];
        expect(
            inDocumentOrder(entries, (entry) => entry.element).map(
                (entry) => entry.element.id,
            ),
        ).toEqual(["a", "b", "c"]);
    });
});
