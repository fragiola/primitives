import { describe, expect, it } from "vitest";
import { statusAttributes } from "../progress/directives/progress-root.directive.ts";
import { radioAttributes } from "../radio/directives/radio-root.directive.ts";
import {
    type RadioEntry,
    radiosInOrder,
    tabStopOf,
} from "../radio-group/directives/radio-group.directive.ts";
import { switchAttributes } from "../switch/directives/switch-root.directive.ts";

// spec/radio-group.md "Focus", spec/switch.md and spec/progress.md "State attributes and ARIA"
function radios(): RadioEntry[] {
    const group = document.createElement("div");
    const entries = [
        { value: "free", disabled: false },
        { value: "pro", disabled: false },
        { value: "team", disabled: true },
    ].map(({ value, disabled }) => {
        const element = document.createElement("button");
        group.append(element);
        return {
            value,
            disabled,
            element,
            input: document.createElement("input"),
        };
    });
    // registered out of document order
    return [entries[2], entries[0], entries[1]] as RadioEntry[];
}

describe("a radio group's tab stop", () => {
    it("sorts the radios in document order", () => {
        expect(radiosInOrder(radios()).map((entry) => entry.value)).toEqual([
            "free",
            "pro",
            "team",
        ]);
    });

    it("is the checked radio when enabled, else the first enabled one", () => {
        expect(tabStopOf(radios(), "pro")?.value).toBe("pro");
        expect(tabStopOf(radios(), null)?.value).toBe("free");
        expect(tabStopOf(radios(), "team")?.value).toBe("free");
        expect(tabStopOf([], null)).toBeUndefined();
    });
});

describe("the state attributes", () => {
    it("give a radio and a switch exactly one of data-checked and data-unchecked", () => {
        expect(
            radioAttributes({ checked: true, disabled: false, required: true }),
        ).toEqual({ checked: "", unchecked: null, disabled: null });
        expect(
            switchAttributes({
                checked: false,
                disabled: true,
                readOnly: true,
                required: false,
            }),
        ).toEqual({
            checked: null,
            unchecked: "",
            disabled: "",
            readonly: "",
            required: null,
        });
    });

    it("give a progress exactly one status", () => {
        expect(statusAttributes("indeterminate")).toEqual({
            indeterminate: "",
            progressing: null,
            complete: null,
        });
        expect(statusAttributes("complete")).toEqual({
            indeterminate: null,
            progressing: null,
            complete: "",
        });
    });
});
