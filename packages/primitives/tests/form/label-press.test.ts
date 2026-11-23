import { afterEach, describe, expect, it } from "vitest";
import {
    labelFocusTarget,
    preventLabelSelection,
} from "../../src/form/label-press.ts";

afterEach(() => {
    document.body.replaceChildren();
});

// spec/label.md, "Pointer"
describe("a Label's press", () => {
    it("selects no text on a double press, unless it lands on a control inside", () => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        label.append("Name", input);
        document.body.append(label);
        const double = new MouseEvent("mousedown", {
            cancelable: true,
            detail: 2,
        });
        Object.defineProperty(double, "target", { value: label });
        preventLabelSelection(double);
        expect(double.defaultPrevented).toBe(true);
        const single = new MouseEvent("mousedown", {
            cancelable: true,
            detail: 1,
        });
        Object.defineProperty(single, "target", { value: label });
        preventLabelSelection(single);
        expect(single.defaultPrevented).toBe(false);
        const inside = new MouseEvent("mousedown", {
            cancelable: true,
            detail: 2,
        });
        Object.defineProperty(inside, "target", { value: input });
        preventLabelSelection(inside);
        expect(inside.defaultPrevented).toBe(false);
    });

    it("focuses what `for` names when it is no labelable element", () => {
        document.body.innerHTML = `
            <label for="email">Email</label><input id="email">
            <label for="volume">Volume</label><div id="volume"><div role="slider" tabindex="0"></div></div>
            <label for="thumb">Thumb</label><div id="thumb" role="slider" tabindex="0"></div>
            <label for="missing">Missing</label>`;
        const [email, volume, thumb, missing] = [
            ...document.querySelectorAll("label"),
        ];
        expect(labelFocusTarget(email as HTMLLabelElement)).toBeNull();
        expect(labelFocusTarget(volume as HTMLLabelElement)).toBe(
            document.querySelector("#volume [role=slider]"),
        );
        expect(labelFocusTarget(thumb as HTMLLabelElement)).toBe(
            document.getElementById("thumb"),
        );
        expect(labelFocusTarget(missing as HTMLLabelElement)).toBeNull();
    });
});
