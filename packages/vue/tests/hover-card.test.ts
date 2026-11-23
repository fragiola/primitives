import { HoverCard } from "@fragiola/primitives-vue/hover-card";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { type Component, h, nextTick } from "vue";

let unmount: (() => void) | undefined;
afterEach(() => {
    unmount?.();
    unmount = undefined;
});

// spec/hover-card.md: a link trigger, and a controlled open card with no role
describe("HoverCard", () => {
    it("renders its trigger as a link and opens controlled", async () => {
        const wrapper = mount(
            {
                render: () =>
                    h(HoverCard.Root, { open: true }, () => [
                        h(HoverCard.Trigger, { href: "#ada" }, () => "@ada"),
                        h(HoverCard.Portal, null, () =>
                            h(HoverCard.Positioner, null, () =>
                                h(HoverCard.Popup, null, () => "Ada"),
                            ),
                        ),
                    ]),
            } as Component,
            { attachTo: document.body },
        );
        unmount = () => wrapper.unmount();
        await nextTick();
        await nextTick();
        const trigger = document.querySelector(
            '[data-primitives-part="hover-card-trigger"]',
        );
        expect(trigger?.tagName).toBe("A");
        const popup = document.querySelector(
            '[data-primitives-part="hover-card-popup"]',
        );
        expect(popup?.hasAttribute("role")).toBe(false);
        expect(popup?.getAttribute("tabindex")).toBe("-1");
    });
});
