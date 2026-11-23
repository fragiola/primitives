import { createToastManager, Toast } from "@fragiola/primitives-vue/toast";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { type Component, defineComponent, h, nextTick } from "vue";

let unmount: (() => void) | undefined;
afterEach(() => {
    unmount?.();
    unmount = undefined;
});

const List = defineComponent({
    setup() {
        const manager = Toast.useToastManager();
        return () =>
            h(Toast.Viewport, { "aria-label": "Notifications" }, () =>
                manager.toasts.value.map((toast) =>
                    h(Toast.Root, { key: toast.id, toast }, () => [
                        h(Toast.Title),
                        h(Toast.Close, null, () => "Dismiss"),
                    ]),
                ),
            );
    },
});

// spec/toast.md: a queue from a plain module renders through the Provider
describe("Toast", () => {
    it("renders the toasts of a module's queue and closes one with Close", async () => {
        const queue = createToastManager({ timeout: 0 });
        const wrapper = mount(
            {
                render: () =>
                    h(Toast.Provider, { toastManager: queue }, () => h(List)),
            } as Component,
            { attachTo: document.body },
        );
        unmount = () => wrapper.unmount();
        queue.add({ title: "Saved" });
        await nextTick();
        await nextTick();
        const root = document.querySelector(
            '[data-primitives-part="toast-root"]',
        );
        expect(root?.getAttribute("role")).toBe("dialog");
        expect(
            document.querySelector('[data-primitives-part="toast-title"]')
                ?.textContent,
        ).toBe("Saved");
        (
            document.querySelector(
                '[data-primitives-part="toast-close"]',
            ) as HTMLElement
        ).click();
        expect(queue.toasts()[0]?.closing).toBe(true);
    });
});
