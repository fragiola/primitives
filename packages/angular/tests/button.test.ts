import { describe, expect, it } from "vitest";
import {
    buttonAttributes,
    nativeKeyAction,
} from "../button/directives/button.directive.ts";

// spec/button.md, "State attributes and ARIA" and "Keyboard": what React's Button renders and does
const options = {
    disabled: false,
    focusableWhenDisabled: false,
    nativeButton: true,
    type: undefined,
    tabIndex: null,
};

describe("buttonAttributes", () => {
    it("gives a native button type=button, disabled, or aria-disabled while focusable", () => {
        expect(buttonAttributes(options)).toEqual({
            type: "button",
            role: null,
            disabled: null,
            "aria-disabled": null,
            tabindex: null,
        });
        expect(buttonAttributes({ ...options, disabled: true })).toMatchObject({
            disabled: "",
            "aria-disabled": null,
        });
        expect(
            buttonAttributes({
                ...options,
                disabled: true,
                focusableWhenDisabled: true,
                type: "submit",
            }),
        ).toMatchObject({
            type: "submit",
            disabled: null,
            "aria-disabled": "true",
        });
    });

    it("gives another element the role, the tab order, and -1 while disabled and not focusable", () => {
        const span = { ...options, nativeButton: false };
        expect(buttonAttributes(span)).toEqual({
            type: null,
            role: "button",
            disabled: null,
            "aria-disabled": null,
            tabindex: "0",
        });
        expect(buttonAttributes({ ...span, tabIndex: "2" }).tabindex).toBe("2");
        expect(buttonAttributes({ ...span, disabled: true })).toMatchObject({
            "aria-disabled": "true",
            tabindex: "-1",
        });
        expect(
            buttonAttributes({
                ...span,
                disabled: true,
                focusableWhenDisabled: true,
            }),
        ).toMatchObject({ "aria-disabled": "true", tabindex: "0" });
    });
});

describe("nativeKeyAction", () => {
    it("clicks on Enter's key down and on Space's key up; Space's key down only prevents the scroll", () => {
        expect(nativeKeyAction("keydown", "Enter")).toBe("click");
        expect(nativeKeyAction("keydown", " ")).toBe("prevent");
        expect(nativeKeyAction("keyup", " ")).toBe("click-on-keyup");
        expect(nativeKeyAction("keyup", "Enter")).toBeNull();
        expect(nativeKeyAction("keydown", "a")).toBeNull();
    });
});
