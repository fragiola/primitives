import { Menu } from "@fragiola/primitives-vue/menu";
import { Menubar } from "@fragiola/primitives-vue/menubar";
import { Toolbar } from "@fragiola/primitives-vue/toolbar";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { type Component, h, nextTick } from "vue";

let unmount: (() => void) | undefined;
afterEach(() => {
    unmount?.();
    unmount = undefined;
});

/** Mounts a tree in the document, then lets the items register. */
async function render(tree: () => ReturnType<typeof h>) {
    const wrapper = mount({ render: tree } as Component, {
        attachTo: document.body,
    });
    unmount = () => wrapper.unmount();
    await nextTick();
    await nextTick();
    return wrapper;
}

const named = (name: string) =>
    [...document.querySelectorAll<HTMLElement>("button")].find(
        (element) => element.textContent === name,
    ) as HTMLElement;

// spec/menu.md, "In a Menubar": the contract of a parent bar reaches the bar's own menus only
describe("a Menu.Trigger and its bar", () => {
    it("outside a bar, and in a Toolbar, is a plain menu button that joins no roving scope", async () => {
        await render(() =>
            h("div", [
                h(Menu.Root, null, () =>
                    h(Menu.Trigger, { disabled: true }, () => "Alone"),
                ),
                h(Toolbar.Root, { "aria-label": "Formatting" }, () => [
                    h(Toolbar.Button, null, () => "Bold"),
                    h(Menu.Root, null, () =>
                        h(Menu.Trigger, null, () => "More"),
                    ),
                ]),
            ]),
        );
        const alone = named("Alone");
        expect(alone).toHaveProperty("disabled", true);
        expect(alone.getAttribute("role")).toBeNull();
        expect(named("More").getAttribute("tabindex")).toBeNull();
        expect(named("Bold").getAttribute("tabindex")).toBe("0");
    });

    it("in a disabled bar, is a focusable disabled item; the first holds the tab stop", async () => {
        await render(() =>
            h(Menubar, { "aria-label": "Application", disabled: true }, () => [
                h(Menu.Root, null, () => h(Menu.Trigger, null, () => "File")),
                h(Menu.Root, null, () => h(Menu.Trigger, null, () => "Edit")),
            ]),
        );
        const bar = document.querySelector<HTMLElement>('[role="menubar"]');
        expect(bar?.dataset.disabled).toBe("");
        const [file, edit] =
            document.querySelectorAll<HTMLElement>('[role="menuitem"]');
        expect(file).toHaveProperty("disabled", false);
        expect(file?.getAttribute("aria-disabled")).toBe("true");
        expect(file?.getAttribute("tabindex")).toBe("0");
        expect(edit?.getAttribute("tabindex")).toBe("-1");
    });

    it("a Menu inside a bar's menu is no menu of the bar", async () => {
        await render(() =>
            h(Menubar, { "aria-label": "Application" }, () =>
                h(Menu.Root, { defaultOpen: true }, () => [
                    h(Menu.Trigger, null, () => "File"),
                    h(Menu.Portal, null, () =>
                        h(Menu.Positioner, null, () =>
                            h(Menu.Popup, null, () =>
                                h(Menu.Root, null, () =>
                                    h(Menu.Trigger, null, () => "Inner"),
                                ),
                            ),
                        ),
                    ),
                ]),
            ),
        );
        const inner = named("Inner");
        expect(inner.getAttribute("role")).toBeNull();
        expect(inner.getAttribute("tabindex")).toBeNull();
    });
});
