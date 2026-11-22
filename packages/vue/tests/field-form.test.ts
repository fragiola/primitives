import { Checkbox } from "@fragiola/primitives-vue/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-vue/checkbox-group";
import { Field } from "@fragiola/primitives-vue/field";
import { Radio } from "@fragiola/primitives-vue/radio";
import { RadioGroup } from "@fragiola/primitives-vue/radio-group";
import { Switch } from "@fragiola/primitives-vue/switch";
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

// spec/field.md, "Integration contract": a RadioGroup is its field's control, validated through
// its first enabled radio's hidden input; its radios take the field's name
describe("a RadioGroup and a Switch in Fields, in a native form", () => {
    it("names the radios after the field, and validates the group on the form's submission", async () => {
        const wrapper = mount(
            () =>
                h("form", [
                    h(Field.Root, { name: "contact" }, () => [
                        h(Field.Label, () => "Contact by"),
                        h(RadioGroup, { required: true }, () => [
                            h(Radio.Root, { value: "email", disabled: true }),
                            h(Radio.Root, { value: "phone" }),
                        ]),
                        h(Field.Error, () => "Choose how we reach you."),
                    ]),
                    h(Field.Root, { name: "alerts" }, () => [
                        h(Switch.Root, { uncheckedValue: "off" }),
                        h(Field.Label, () => "Email alerts"),
                    ]),
                ]),
            { attachTo: document.body },
        );
        await nextTick();
        const inputs = wrapper.findAll('[data-primitives-part="radio-input"]');
        expect(inputs.map((input) => input.attributes("name"))).toEqual([
            "contact",
            "contact",
        ]);
        expect(
            wrapper
                .find('[data-primitives-part="switch-unchecked-input"]')
                .attributes("name"),
        ).toBe("alerts");
        wrapper
            .find("form")
            .element.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true }),
            );
        await nextTick();
        expect(wrapper.text()).toContain("Choose how we reach you.");
        expect(
            wrapper.find('[role="radiogroup"]').attributes("aria-invalid"),
        ).toBe("true");
        // the first enabled radio holds the tab stop
        const [email, phone] = wrapper.findAll('[role="radio"]');
        expect(email?.attributes("tabindex")).toBe("-1");
        expect(phone?.attributes("tabindex")).toBe("0");
        wrapper.unmount();
    });
});
