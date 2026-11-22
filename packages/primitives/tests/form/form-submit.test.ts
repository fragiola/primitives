import { describe, expect, it, vi } from "vitest";
import {
    formErrorsFor,
    withoutFormErrors,
} from "../../src/form/form-errors.ts";
import {
    firstInDocumentOrder,
    focusFieldControl,
    guardFormSubmit,
} from "../../src/form/form-submit.ts";

describe("formErrorsFor / withoutFormErrors (spec/form.md)", () => {
    it("reads a field's errors as a list", () => {
        const errors = { email: "Taken.", tags: ["One.", "", "Two."] };
        expect(formErrorsFor(errors, "email")).toEqual(["Taken."]);
        expect(formErrorsFor(errors, "tags")).toEqual(["One.", "Two."]);
        expect(formErrorsFor(errors, "other")).toEqual([]);
        expect(formErrorsFor(errors, undefined)).toEqual([]);
        expect(formErrorsFor(undefined, "email")).toEqual([]);
    });

    it("drops one key, and keeps the object when it has none", () => {
        const errors = { email: "Taken.", name: "Short." };
        expect(withoutFormErrors(errors, "email")).toEqual({ name: "Short." });
        expect(withoutFormErrors(errors, "other")).toBe(errors);
    });
});

describe("guardFormSubmit (spec/form.md, A submission)", () => {
    it("stops a blocked submission before the consumer's listeners", () => {
        document.body.innerHTML = `<form><button>Submit</button></form>`;
        const form = document.querySelector("form") as HTMLFormElement;
        const consumer = vi.fn((event: Event) => event.preventDefault());
        const above = vi.fn();
        form.addEventListener("submit", consumer);
        document.body.addEventListener("submit", above);
        let allow = false;
        const cleanup = guardFormSubmit(form, () => allow);
        const event = new Event("submit", { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
        expect(consumer).not.toHaveBeenCalled();
        expect(above).not.toHaveBeenCalled();
        allow = true;
        form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
        );
        expect(consumer).toHaveBeenCalledTimes(1);
        expect(above).toHaveBeenCalledTimes(1);
        cleanup();
        allow = false;
        form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
        );
        expect(consumer).toHaveBeenCalledTimes(2);
    });
});

describe("firstInDocumentOrder / focusFieldControl", () => {
    it("picks the first element in document order", () => {
        document.body.innerHTML = `<input id="a"><input id="b"><input id="c">`;
        const [a, b, c] = ["a", "b", "c"].map(
            (id) => document.getElementById(id) as HTMLElement,
        );
        expect(firstInDocumentOrder([c, null, b, a])).toBe(a);
        expect(firstInDocumentOrder([])).toBeNull();
    });

    it("focuses and selects a text input", () => {
        document.body.innerHTML = `<input value="ada">`;
        const element = document.querySelector("input") as HTMLInputElement;
        focusFieldControl(element);
        expect(document.activeElement).toBe(element);
        expect(element.selectionStart).toBe(0);
        expect(element.selectionEnd).toBe(3);
    });
});
