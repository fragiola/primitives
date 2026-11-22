import { Checkbox } from "@fragiola/primitives-vue/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-vue/checkbox-group";
import { Field } from "@fragiola/primitives-vue/field";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";

// spec/field.md, "When the result is shown": a control with no validated element of its own (a
// CheckboxGroup) in a native form validates on the form's submission attempt
describe("a CheckboxGroup in a Field, in a native form", () => {
    it("validates on the form's submission", async () => {
        const wrapper = mount(
            () =>
                h("form", [
                    h(
                        Field.Root,
                        {
                            name: "toppings",
                            validate: (value: unknown) =>
                                Array.isArray(value) && value.length === 0
                                    ? "Choose a topping."
                                    : null,
                        },
                        () => [
                            h(Field.Label, () => "Toppings"),
                            h(CheckboxGroup, () => [
                                h(Checkbox.Root, { value: "cheese" }),
                                h(Checkbox.Root, { value: "ham" }),
                            ]),
                            h(Field.Error),
                        ],
                    ),
                ]),
            { attachTo: document.body },
        );
        await nextTick();
        expect(wrapper.text()).not.toContain("Choose a topping.");
        wrapper
            .find("form")
            .element.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true }),
            );
        await nextTick();
        expect(wrapper.text()).toContain("Choose a topping.");
        expect(wrapper.find('[role="group"]').attributes("aria-invalid")).toBe(
            "true",
        );
        wrapper.unmount();
    });
});
