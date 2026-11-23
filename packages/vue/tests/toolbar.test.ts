import { Toggle } from "@fragiola/primitives-vue/toggle";
import { ToggleGroup } from "@fragiola/primitives-vue/toggle-group";
import { Toolbar } from "@fragiola/primitives-vue/toolbar";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
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

const button = (name: string) =>
    [...document.querySelectorAll<HTMLElement>('[role="button"], button')].find(
        (element) => element.textContent === name,
    ) as HTMLElement;
const key = (element: HTMLElement, name: string) =>
    element.dispatchEvent(
        new KeyboardEvent("keydown", {
            key: name,
            bubbles: true,
            cancelable: true,
        }),
    );

// spec/toolbar.md, "Nested composites" (5): a disabled scope disables the items inside it
describe("a disabled Toolbar and Toolbar.Group", () => {
    it("disable their buttons, inputs and a nested ToggleGroup's toggles; a link stays", async () => {
        await render(() =>
            h(
                Toolbar.Root,
                { "aria-label": "Formatting", disabled: true },
                () => [
                    h(ToggleGroup, { "aria-label": "Text style" }, () => [
                        h(Toggle, { value: "bold" }, () => "Bold"),
                    ]),
                    h(Toolbar.Button, null, () => "Undo"),
                    h(Toolbar.Input, { "aria-label": "Search" }),
                    h(Toolbar.Link, { href: "#help" }, () => "Help"),
                ],
            ),
        );
        expect(button("Bold")).toHaveProperty("disabled", true);
        expect(
            document.querySelector<HTMLElement>('[role="group"]')?.dataset
                .disabled,
        ).toBe("");
        expect(button("Undo")).toHaveProperty("disabled", true);
        expect(document.querySelector("input")).toHaveProperty(
            "disabled",
            true,
        );
        // the link holds the tab stop, the only item that can take focus
        expect(document.querySelector("a")?.getAttribute("tabindex")).toBe("0");
    });

    it("a disabled Toolbar.Group disables its items only", async () => {
        await render(() =>
            h(Toolbar.Root, { "aria-label": "Formatting" }, () => [
                h(
                    Toolbar.Group,
                    { "aria-label": "History", disabled: true },
                    () => [
                        h(Toolbar.Button, null, () => "Undo"),
                        h(Toggle, null, () => "Snap"),
                    ],
                ),
                h(Toolbar.Button, null, () => "Share"),
            ]),
        );
        expect(button("Undo")).toHaveProperty("disabled", true);
        expect(button("Snap")).toHaveProperty("disabled", true);
        expect(button("Share")).toHaveProperty("disabled", false);
        expect(button("Share").getAttribute("tabindex")).toBe("0");
    });
});

// spec/toolbar.md, "Disabled items"
describe("a focusable disabled Toolbar.Input and Toolbar.Button", () => {
    it("are aria-disabled, the input read-only, and the button lets the toolbar's keys through", async () => {
        const onClick = vi.fn();
        await render(() =>
            h(Toolbar.Root, { "aria-label": "Formatting" }, () => [
                h(
                    Toolbar.Button,
                    { disabled: true, focusableWhenDisabled: true, onClick },
                    () => "Share",
                ),
                h(Toolbar.Input, {
                    "aria-label": "Search",
                    disabled: true,
                    focusableWhenDisabled: true,
                }),
            ]),
        );
        const input = document.querySelector("input") as HTMLInputElement;
        expect(input.getAttribute("aria-disabled")).toBe("true");
        expect(input.readOnly).toBe(true);
        expect(input.disabled).toBe(false);
        const share = button("Share");
        expect(share.getAttribute("tabindex")).toBe("0");
        expect(key(share, "Enter")).toBe(false);
        share.click();
        expect(onClick).not.toHaveBeenCalled();
        share.focus();
        // the toolbar moves the focus: the disabled button did not prevent the arrow
        expect(key(share, "ArrowRight")).toBe(false);
        expect(document.activeElement).toBe(input);
    });
});

// spec/toggle.md, "API": inside a group, pressed-change reports before the group's change
describe("a Toggle in a ToggleGroup", () => {
    it("reports its pressed state, then the group its value", async () => {
        const calls: string[] = [];
        await render(() =>
            h(
                ToggleGroup,
                {
                    "aria-label": "Alignment",
                    onValueChange: (value: string[]) =>
                        calls.push(`group:${value.join()}`),
                },
                () => [
                    h(
                        Toggle,
                        {
                            value: "left",
                            pressed: false,
                            onPressedChange: (pressed: boolean) =>
                                calls.push(`left:${pressed}`),
                        },
                        () => "Left",
                    ),
                ],
            ),
        );
        button("Left").click();
        await nextTick();
        expect(calls).toEqual(["left:true", "group:left"]);
        // the group's value wins over the Toggle's own `pressed`
        expect(button("Left").getAttribute("aria-pressed")).toBe("true");
    });
});
