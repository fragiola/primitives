import {
    DirectionProvider,
    useDirection,
} from "@fragiola/primitives-vue/direction";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";

// spec/direction.md: the provider gives its direction to everything inside it, renders only its
// children, and a nested provider wins; without one, `useDirection()` reads `"ltr"`.
const Reader = defineComponent({
    setup() {
        const direction = useDirection();
        return () => h("span", { "data-testid": "read" }, direction.value);
    },
});

describe("DirectionProvider and useDirection", () => {
    it("reads ltr without a provider", () => {
        expect(mount(Reader).text()).toBe("ltr");
    });

    it("gives its direction, renders no element of its own, and follows its prop", async () => {
        const wrapper = mount(DirectionProvider, {
            props: { direction: "rtl" },
            slots: { default: () => h(Reader) },
        });
        expect(wrapper.html()).toBe('<span data-testid="read">rtl</span>');
        await wrapper.setProps({ direction: "ltr" });
        expect(wrapper.text()).toBe("ltr");
    });

    it("defaults to ltr, and a nested provider wins", () => {
        const wrapper = mount(DirectionProvider, {
            slots: {
                default: () => [
                    h(Reader),
                    h(DirectionProvider, { direction: "rtl" }, () => h(Reader)),
                ],
            },
        });
        expect(wrapper.findAll("span").map((span) => span.text())).toEqual([
            "ltr",
            "rtl",
        ]);
    });
});
