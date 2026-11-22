import { Checkbox } from "@fragiola/primitives-react/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-react/checkbox-group";
import { Field } from "@fragiola/primitives-react/field";
import { Radio } from "@fragiola/primitives-react/radio";
import { RadioGroup } from "@fragiola/primitives-react/radio-group";
import { Switch } from "@fragiola/primitives-react/switch";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

// spec/field.md, "When the result is shown": a control with no validated element of its own (a
// CheckboxGroup) in a native form validates on the form's submission attempt
describe("a CheckboxGroup in a Field, in a native form", () => {
    it("validates on the form's submission", async () => {
        render(
            <form>
                <Field.Root
                    name="toppings"
                    validate={(value) =>
                        Array.isArray(value) && value.length === 0
                            ? "Choose a topping."
                            : null
                    }
                >
                    <Field.Label>Toppings</Field.Label>
                    <CheckboxGroup>
                        <Checkbox.Root value="cheese" />
                        <Checkbox.Root value="ham" />
                    </CheckboxGroup>
                    <Field.Error />
                </Field.Root>
            </form>,
        );
        expect(screen.queryByText("Choose a topping.")).toBeNull();
        const form = document.querySelector("form") as HTMLFormElement;
        await act(async () => {
            form.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true }),
            );
        });
        expect(screen.getByText("Choose a topping.")).not.toBeNull();
        expect(screen.getByRole("group").getAttribute("aria-invalid")).toBe(
            "true",
        );
    });
});

// spec/field.md, "Integration contract": a RadioGroup is its field's control, validated through
// its first enabled radio's hidden input; its radios take the field's name
describe("a RadioGroup and a Switch in Fields, in a native form", () => {
    it("names the radios after the field, and validates the group on the form's submission", async () => {
        render(
            <form>
                <Field.Root name="contact">
                    <Field.Label>Contact by</Field.Label>
                    <RadioGroup required>
                        <Radio.Root value="email" disabled />
                        <Radio.Root value="phone" />
                    </RadioGroup>
                    <Field.Error>Choose how we reach you.</Field.Error>
                </Field.Root>
                <Field.Root name="alerts">
                    <Switch.Root uncheckedValue="off" />
                    <Field.Label>Email alerts</Field.Label>
                </Field.Root>
            </form>,
        );
        const inputs = document.querySelectorAll<HTMLInputElement>(
            '[data-primitives-part="radio-input"]',
        );
        expect([...inputs].map((input) => input.name)).toEqual([
            "contact",
            "contact",
        ]);
        expect(
            document
                .querySelector(
                    '[data-primitives-part="switch-unchecked-input"]',
                )
                ?.getAttribute("name"),
        ).toBe("alerts");
        const form = document.querySelector("form") as HTMLFormElement;
        await act(async () => {
            form.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true }),
            );
        });
        expect(screen.getByText("Choose how we reach you.")).not.toBeNull();
        expect(
            screen.getByRole("radiogroup").getAttribute("aria-invalid"),
        ).toBe("true");
        // the first enabled radio holds the tab stop
        const [email, phone] = screen.getAllByRole("radio");
        expect(email?.getAttribute("tabindex")).toBe("-1");
        expect(phone?.getAttribute("tabindex")).toBe("0");
    });
});
