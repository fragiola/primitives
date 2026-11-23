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

    // Epic #49 (#46): the browser would focus the first control whose `invalid` it may handle, a
    // later native one; the bridge that took the focus cancels the later controls' events
    it("cancels the later controls' invalid events of the validation it took the focus in", () => {
        document.body.innerHTML = `<form><input id="hidden" required><button id="trigger"></button><input id="native" required></form>`;
        const hidden = document.getElementById("hidden") as HTMLInputElement;
        const native = document.getElementById("native") as HTMLInputElement;
        const trigger = document.getElementById("trigger") as HTMLElement;
        const end = bridgeForm(hidden, { invalid: () => trigger });
        const first = new Event("invalid", { cancelable: true });
        hidden.dispatchEvent(first);
        const later = new Event("invalid", { cancelable: true });
        native.dispatchEvent(later);
        expect(first.defaultPrevented).toBe(true);
        expect(later.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(trigger);
        // the next validation is the browser's again
        vi.runAllTimers();
        const next = new Event("invalid", { cancelable: true });
        native.dispatchEvent(next);
        expect(next.defaultPrevented).toBe(false);
        end();
    });

    it("leaves the later controls alone when its input is not the first invalid one", () => {
        document.body.innerHTML = `<form><input id="native" required><input id="hidden" required><button id="trigger"></button><input id="last" required></form>`;
        const hidden = document.getElementById("hidden") as HTMLInputElement;
        const last = document.getElementById("last") as HTMLInputElement;
        const trigger = document.getElementById("trigger") as HTMLElement;
        bridgeForm(hidden, { invalid: () => trigger });
        hidden.dispatchEvent(new Event("invalid", { cancelable: true }));
        const later = new Event("invalid", { cancelable: true });
        last.dispatchEvent(later);
        expect(later.defaultPrevented).toBe(false);
        expect(document.activeElement).not.toBe(trigger);
    });

    // Epic #49 review: a control associated by `form="id"` outside the form's element is one of
    // its controls too; another form's controls are not
    it("cancels a later control associated by `form` outside the form, not another form's", () => {
        document.body.innerHTML = `<form id="order"><input id="hidden" required><button id="trigger"></button></form><input id="outside" form="order" required><form><input id="other" required></form>`;
        const hidden = document.getElementById("hidden") as HTMLInputElement;
        const outside = document.getElementById("outside") as HTMLInputElement;
        const other = document.getElementById("other") as HTMLInputElement;
        const trigger = document.getElementById("trigger") as HTMLElement;
        const end = bridgeForm(hidden, { invalid: () => trigger });
        hidden.dispatchEvent(new Event("invalid", { cancelable: true }));
        const later = new Event("invalid", { cancelable: true });
        outside.dispatchEvent(later);
        expect(later.defaultPrevented).toBe(true);
        const foreign = new Event("invalid", { cancelable: true });
        other.dispatchEvent(foreign);
        expect(foreign.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(trigger);
        end();
    });
});
