import {
    asProp,
    renderPart,
    stateAttributes,
} from "@fragiola/primitives-vue/render";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";

// spec/README.md, "Render utilities": an app's own part, written with the public utilities as the
// library's parts are.
const Toggle = defineComponent({
    inheritAttrs: false,
    props: { ...asProp, pressed: { type: Boolean, default: false } },
    setup(props, { attrs, slots }) {
        return () =>
            renderPart(
                "button",
                { attrs, slots },
                props.as,
                { pressed: props.pressed },
                {
                    type: "button",
                    "aria-pressed": props.pressed ? "true" : "false",
                    "data-primitives-part": "toggle-root",
                    ...stateAttributes({ pressed: props.pressed }),
                },
            );
    },
});

describe("the render utilities", () => {
    it("stateAttributes: true is an empty attribute, false none, a string a value", () => {
        expect(
            stateAttributes({ open: true, disabled: false, side: "top" }),
        ).toEqual({ "data-open": "", "data-side": "top" });
    });

    it("renderPart merges the consumer's attributes onto the default element", () => {
        const wrapper = mount(Toggle, {
            props: { pressed: true },
            attrs: { class: "mine", "aria-label": "Bold" },
            slots: { default: () => "B" },
        });
        const button = wrapper.get("button");
        expect(button.attributes()).toMatchObject({
            type: "button",
            "aria-pressed": "true",
            "aria-label": "Bold",
            class: "mine",
            "data-pressed": "",
            "data-primitives-part": "toggle-root",
        });
        expect(button.text()).toBe("B");
    });

    it("renders `as`, or the render slot with the props and the state", () => {
        expect(
            mount(Toggle, { props: { as: "a" } })
                .get("a")
                .attributes("type"),
        ).toBe("button");
        const wrapper = mount(Toggle, {
            props: { pressed: true },
            slots: {
                render: ({
                    props,
                    state,
                }: {
                    props: Record<string, unknown>;
                    state: { pressed: boolean };
                }) => [
                    `${String(props["data-primitives-part"])} ${state.pressed}`,
                ],
            },
        });
        expect(wrapper.text()).toBe("toggle-root true");
    });
});
