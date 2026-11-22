import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bridgeForm } from "../../src/form/form-bridge.ts";

describe("bridgeForm", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML =
            '<form><input name="fruit" required><button type="button">Trigger</button></form>';
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("reports a reset once the browser has reset the controls", () => {
        const input = document.querySelector("input") as HTMLInputElement;
        const reset = vi.fn();
        const end = bridgeForm(input, { reset });
        input.form?.reset();
        expect(reset).not.toHaveBeenCalled();
        vi.runAllTimers();
        expect(reset).toHaveBeenCalledOnce();
        end();
        input.form?.reset();
        vi.runAllTimers();
        expect(reset).toHaveBeenCalledOnce();
    });

    it("sends the focus of a failed validation to the primitive", () => {
        const input = document.querySelector("input") as HTMLInputElement;
        input.required = true;
        input.value = "";
        const trigger = document.querySelector("button") as HTMLButtonElement;
        bridgeForm(input, { invalid: () => trigger });
        const event = new Event("invalid", { cancelable: true });
        input.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(trigger);
    });

    it("focuses only the first invalid control's primitive", () => {
        document.body.innerHTML = `<form><button id="a"></button><input required><button id="b"></button><input required></form>`;
        const [first, second] = [...document.querySelectorAll("input")];
        const a = document.getElementById("a") as HTMLButtonElement;
        const b = document.getElementById("b") as HTMLButtonElement;
        bridgeForm(first as HTMLInputElement, { invalid: () => a });
        bridgeForm(second as HTMLInputElement, { invalid: () => b });
        // the browser fires `invalid` on each invalid control, in order
        for (const input of [first, second]) {
            input?.dispatchEvent(new Event("invalid", { cancelable: true }));
        }
        expect(document.activeElement).toBe(a);
    });
});
