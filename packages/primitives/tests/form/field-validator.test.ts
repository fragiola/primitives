import { describe, expect, it } from "vitest";
import {
    fieldErrorMessages,
    fieldErrorShown,
} from "../../src/form/field-error-shown.ts";
import {
    createFieldValidator,
    type FieldValidation,
    UNVALIDATED,
    validateField,
} from "../../src/form/field-validity.ts";

function input(html: string): HTMLInputElement {
    document.body.innerHTML = `<form>${html}</form>`;
    return document.querySelector("input") as HTMLInputElement;
}

/** A promise and its resolver, for a `validate` the test answers when it wants. */
function deferred<T>() {
    let resolve: (value: T) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<T>((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe("createFieldValidator (spec/field.md, Async validation)", () => {
    it("answers a sync validate at once", () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        const settled: FieldValidation[] = [];
        const result = validator.run(
            element,
            {
                value: "a",
                validate: () => "No.",
                valueChanged: true,
                always: false,
            },
            (validation) => settled.push(validation),
        );
        expect(result?.errors).toEqual(["No."]);
        expect(element.validationMessage).toBe("No.");
        expect(settled).toEqual([]);
    });

    it("settles an async validate when it resolves, and sets the custom validity then", async () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        const answer = deferred<string | null>();
        const settled: FieldValidation[] = [];
        const result = validator.run(
            element,
            {
                value: "ada",
                validate: () => answer.promise,
                valueChanged: true,
                always: true,
            },
            (validation) => settled.push(validation),
        );
        expect(result).toBeNull();
        expect(element.validity.customError).toBe(false);
        answer.resolve("Taken.");
        await flush();
        expect(settled).toHaveLength(1);
        expect(settled[0]?.validity.customError).toBe(true);
        expect(settled[0]?.errors).toEqual(["Taken."]);
        expect(element.validationMessage).toBe("Taken.");
    });

    it("drops a run that resolves after a newer one started (latest wins)", async () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        const slow = deferred<string | null>();
        const fast = deferred<string | null>();
        const settled: FieldValidation[] = [];
        const settle = (validation: FieldValidation) =>
            settled.push(validation);
        validator.run(
            element,
            {
                value: "ada",
                validate: () => slow.promise,
                valueChanged: true,
                always: true,
            },
            settle,
        );
        validator.run(
            element,
            {
                value: "adb",
                validate: () => fast.promise,
                valueChanged: true,
                always: true,
            },
            settle,
        );
        fast.resolve(null);
        await flush();
        slow.resolve("Taken.");
        await flush();
        expect(settled).toHaveLength(1);
        expect(settled[0]?.validity.valid).toBe(true);
        expect(element.validity.customError).toBe(false);
    });

    it("reuses the last resolved answer for the same value, without calling validate", async () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        let calls = 0;
        const validate = () => {
            calls += 1;
            return Promise.resolve("Taken.");
        };
        validator.run(
            element,
            { value: "ada", validate, valueChanged: true, always: true },
            () => {},
        );
        await flush();
        const again = validator.run(
            element,
            { value: "ada", validate, valueChanged: true, always: true },
            () => {},
        );
        expect(calls).toBe(1);
        expect(again?.errors).toEqual(["Taken."]);
        expect(element.validationMessage).toBe("Taken.");
    });

    it("counts a rejected promise as no message", async () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        const settled: FieldValidation[] = [];
        validator.run(
            element,
            {
                value: "x",
                validate: () => Promise.reject(new Error("offline")),
                valueChanged: true,
                always: true,
            },
            (validation) => settled.push(validation),
        );
        await flush();
        expect(settled[0]?.validity.valid).toBe(true);
    });

    it("answers a native error at once, without awaiting the promise", () => {
        const element = input("<input required>");
        const validator = createFieldValidator();
        const result = validator.run(
            element,
            {
                value: "",
                validate: () => Promise.resolve("Taken."),
                valueChanged: true,
                always: true,
            },
            () => {},
        );
        expect(result?.validity.valueMissing).toBe(true);
    });

    it("cancel drops the pending run", async () => {
        const element = input("<input>");
        const validator = createFieldValidator();
        const settled: FieldValidation[] = [];
        validator.run(
            element,
            {
                value: "x",
                validate: () => Promise.resolve("No."),
                valueChanged: true,
                always: true,
            },
            (validation) => settled.push(validation),
        );
        validator.cancel();
        await flush();
        expect(settled).toEqual([]);
    });

    it("validateField never awaits a promise", () => {
        const element = input("<input>");
        const result = validateField(element, {
            value: "x",
            validate: () => Promise.resolve("No."),
            valueChanged: true,
            always: true,
        });
        expect(result.validity.valid).toBe(true);
    });
});

describe("Field.Error match (spec/field.md)", () => {
    const invalidRange: FieldValidation = {
        validity: {
            ...UNVALIDATED.validity,
            rangeUnderflow: true,
            valid: false,
        },
        errors: ["Too small."],
    };
    const field = { invalid: true, disabled: false };

    it("takes a function of the validity", () => {
        expect(
            fieldErrorShown(
                (validity) => validity.rangeUnderflow || validity.rangeOverflow,
                invalidRange,
                field,
            ),
        ).toBe(true);
        expect(
            fieldErrorShown(
                (validity) => validity.valueMissing,
                invalidRange,
                field,
            ),
        ).toBe(false);
    });

    it("never shows a function's error in a disabled field", () => {
        expect(
            fieldErrorShown(() => true, invalidRange, {
                invalid: true,
                disabled: true,
            }),
        ).toBe(false);
    });

    it("shows the Form's errors only for an Error with no key or function", () => {
        expect(fieldErrorMessages(undefined, invalidRange, ["Taken."])).toEqual(
            ["Taken."],
        );
        expect(fieldErrorMessages(true, invalidRange, ["Taken."])).toEqual([
            "Taken.",
        ]);
        expect(
            fieldErrorMessages("customError", invalidRange, ["Taken."]),
        ).toEqual(["Too small."]);
        expect(fieldErrorMessages(undefined, invalidRange, [])).toEqual([
            "Too small.",
        ]);
    });
});
