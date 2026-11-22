import { Checkbox } from "@fragiola/primitives-react/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-react/checkbox-group";
import { Field } from "@fragiola/primitives-react/field";
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
