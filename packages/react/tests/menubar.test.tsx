import { Menu } from "@fragiola/primitives-react/menu";
import { Menubar } from "@fragiola/primitives-react/menubar";
import { Toolbar } from "@fragiola/primitives-react/toolbar";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

// spec/menu.md, "In a Menubar": the contract of a parent bar reaches the bar's own menus only
describe("a Menu.Trigger and its bar", () => {
    it("outside a bar, and in a Toolbar, is a plain menu button that joins no roving scope", () => {
        render(
            <>
                <Menu.Root>
                    <Menu.Trigger disabled>Alone</Menu.Trigger>
                </Menu.Root>
                <Toolbar.Root aria-label="Formatting">
                    <Toolbar.Button>Bold</Toolbar.Button>
                    <Menu.Root>
                        <Menu.Trigger>More</Menu.Trigger>
                    </Menu.Root>
                </Toolbar.Root>
            </>,
        );
        const alone = screen.getByRole("button", { name: "Alone" });
        expect(alone).toHaveProperty("disabled", true);
        expect(alone.getAttribute("role")).toBeNull();
        const more = screen.getByRole("button", { name: "More" });
        expect(more.getAttribute("tabindex")).toBeNull();
        expect(
            screen
                .getByRole("button", { name: "Bold" })
                .getAttribute("tabindex"),
        ).toBe("0");
    });

    it("in a disabled bar, is a focusable disabled item; the first holds the tab stop", () => {
        render(
            <Menubar aria-label="Application" disabled>
                <Menu.Root>
                    <Menu.Trigger>File</Menu.Trigger>
                </Menu.Root>
                <Menu.Root>
                    <Menu.Trigger>Edit</Menu.Trigger>
                </Menu.Root>
            </Menubar>,
        );
        const bar = screen.getByRole("menubar", { name: "Application" });
        expect(bar.dataset.disabled).toBe("");
        const [file, edit] = screen.getAllByRole("menuitem");
        expect(file).toHaveProperty("disabled", false);
        expect(file?.getAttribute("aria-disabled")).toBe("true");
        expect(file?.getAttribute("tabindex")).toBe("0");
        expect(edit?.getAttribute("tabindex")).toBe("-1");
    });

    it("a Menu inside a bar's menu is no menu of the bar", () => {
        render(
            <Menubar aria-label="Application">
                <Menu.Root defaultOpen>
                    <Menu.Trigger>File</Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Positioner>
                            <Menu.Popup>
                                <Menu.Root>
                                    <Menu.Trigger>Inner</Menu.Trigger>
                                </Menu.Root>
                            </Menu.Popup>
                        </Menu.Positioner>
                    </Menu.Portal>
                </Menu.Root>
            </Menubar>,
        );
        const inner = screen.getByRole("button", { name: "Inner" });
        expect(inner.getAttribute("role")).toBeNull();
        expect(inner.getAttribute("tabindex")).toBeNull();
    });
});
