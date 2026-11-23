import { Toggle } from "@fragiola/primitives-react/toggle";
import { ToggleGroup } from "@fragiola/primitives-react/toggle-group";
import { Toolbar } from "@fragiola/primitives-react/toolbar";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

const button = (name: string) => screen.getByRole("button", { name });

// spec/toolbar.md, "Nested composites" (5): a disabled scope disables the items inside it
describe("a disabled Toolbar and Toolbar.Group", () => {
    it("disable their buttons, inputs and a nested ToggleGroup's toggles; a link stays", () => {
        render(
            <Toolbar.Root aria-label="Formatting" disabled>
                <ToggleGroup aria-label="Text style">
                    <Toggle value="bold">Bold</Toggle>
                </ToggleGroup>
                <Toolbar.Button>Undo</Toolbar.Button>
                <Toolbar.Input aria-label="Search" />
                <Toolbar.Link href="#help">Help</Toolbar.Link>
            </Toolbar.Root>,
        );
        expect(button("Bold")).toHaveProperty("disabled", true);
        expect(
            screen.getByRole("group", { name: "Text style" }).dataset.disabled,
        ).toBe("");
        expect(button("Undo")).toHaveProperty("disabled", true);
        expect(screen.getByRole("textbox")).toHaveProperty("disabled", true);
        // the link holds the tab stop, the only item that can take focus
        expect(screen.getByRole("link").getAttribute("tabindex")).toBe("0");
    });

    it("a disabled Toolbar.Group disables its items only", () => {
        render(
            <Toolbar.Root aria-label="Formatting">
                <Toolbar.Group aria-label="History" disabled>
                    <Toolbar.Button>Undo</Toolbar.Button>
                    <Toggle>Snap</Toggle>
                </Toolbar.Group>
                <Toolbar.Button>Share</Toolbar.Button>
            </Toolbar.Root>,
        );
        expect(button("Undo")).toHaveProperty("disabled", true);
        expect(button("Snap")).toHaveProperty("disabled", true);
        expect(button("Share")).toHaveProperty("disabled", false);
        expect(button("Share").getAttribute("tabindex")).toBe("0");
    });
});

// spec/toolbar.md, "Disabled items"
describe("a focusable disabled Toolbar.Input and Toolbar.Button", () => {
    it("are aria-disabled, the input read-only, and the button lets the toolbar's keys through", () => {
        const onClick = vi.fn();
        render(
            <Toolbar.Root aria-label="Formatting">
                <Toolbar.Button
                    disabled
                    focusableWhenDisabled
                    onClick={onClick}
                >
                    Share
                </Toolbar.Button>
                <Toolbar.Input
                    aria-label="Search"
                    disabled
                    focusableWhenDisabled
                />
            </Toolbar.Root>,
        );
        const input = screen.getByRole("textbox");
        expect(input.getAttribute("aria-disabled")).toBe("true");
        expect(input).toHaveProperty("readOnly", true);
        expect(input).toHaveProperty("disabled", false);
        const share = button("Share");
        expect(share.getAttribute("tabindex")).toBe("0");
        expect(fireEvent.keyDown(share, { key: "Enter" })).toBe(false);
        fireEvent.click(share);
        expect(onClick).not.toHaveBeenCalled();
        share.focus();
        // the toolbar moves the focus: the disabled button did not prevent the arrow
        expect(fireEvent.keyDown(share, { key: "ArrowRight" })).toBe(false);
        expect(document.activeElement).toBe(input);
    });
});

// spec/toggle.md, "API": inside a group, onPressedChange reports before the group's change
describe("a Toggle in a ToggleGroup", () => {
    it("reports its pressed state, then the group its value", () => {
        const calls: string[] = [];
        render(
            <ToggleGroup
                aria-label="Alignment"
                onValueChange={(value) => calls.push(`group:${value.join()}`)}
            >
                <Toggle
                    value="left"
                    pressed={false}
                    onPressedChange={(pressed) => calls.push(`left:${pressed}`)}
                >
                    Left
                </Toggle>
            </ToggleGroup>,
        );
        fireEvent.click(button("Left"));
        expect(calls).toEqual(["left:true", "group:left"]);
        // the group's value wins over the Toggle's own `pressed`
        expect(button("Left").getAttribute("aria-pressed")).toBe("true");
    });
});
