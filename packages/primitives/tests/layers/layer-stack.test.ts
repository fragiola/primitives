import { afterEach, describe, expect, it, vi } from "vitest";
import { pushLayer } from "../../src/layers/layer-stack.ts";

function element(parent: Element = document.body): HTMLElement {
    const node = document.createElement("div");
    parent.append(node);
    return node;
}

function button(parent: Element): HTMLButtonElement {
    const node = document.createElement("button");
    parent.append(node);
    return node;
}

function press(target: Element): void {
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
}

function pressEscape(): void {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("the layer tree", () => {
    it("sends Escape to the newest layer only", () => {
        const dialog = element();
        const trigger = button(dialog);
        const parent = { onEscape: vi.fn() };
        const child = { onEscape: vi.fn() };
        const a = pushLayer(document, { elements: () => [dialog], ...parent });
        const b = pushLayer(document, {
            elements: () => [element()],
            owner: () => [trigger],
            ...child,
        });
        expect(b.isTop()).toBe(true);
        expect(a.elementsAbove()).toHaveLength(1);
        expect(b.elementsAbove()).toEqual([]);
        pressEscape();
        expect(child.onEscape).toHaveBeenCalledTimes(1);
        expect(parent.onEscape).not.toHaveBeenCalled();
        b.remove();
        expect(a.isTop()).toBe(true);
        pressEscape();
        expect(parent.onEscape).toHaveBeenCalledTimes(1);
        a.remove();
    });

    it("resolves the parent from the owner, else from the focused element, else none", () => {
        const dialog = element();
        const inDialog = button(dialog);
        const popover = element();
        const inPopover = button(popover);
        const a = pushLayer(document, { elements: () => [dialog] });
        // the owner (its trigger) sits in the dialog, whatever the DOM position of its own popup
        const b = pushLayer(document, {
            elements: () => [popover],
            owner: () => [inDialog],
        });
        expect(a.elementsAbove()).toEqual([popover]);
        // no owner inside a layer: the focused element decides
        inPopover.focus();
        const menu = element();
        const c = pushLayer(document, {
            elements: () => [menu],
            owner: () => [element()],
        });
        expect(b.elementsAbove()).toEqual([menu]);
        expect(a.elementsAbove()).toEqual([popover, menu]);
        // neither: a root layer, nobody's descendant
        inPopover.blur();
        const other = element();
        const d = pushLayer(document, { elements: () => [other] });
        expect(a.elementsAbove()).not.toContain(other);
        expect(c.elementsAbove()).toEqual([]);
        d.remove();
        c.remove();
        b.remove();
        a.remove();
    });

    it("dismisses on an outside press every layer but the pressed one and its ancestors, over a three-level tree with a sibling branch", () => {
        // dialog > popover > menu, and a sibling branch: dialog > select
        const dialog = element();
        const popoverTrigger = button(dialog);
        const selectTrigger = button(dialog);
        const popover = element();
        const menuTrigger = button(popover);
        const menu = element();
        const select = element();
        const outside = {
            dialog: vi.fn(),
            popover: vi.fn(),
            menu: vi.fn(),
            select: vi.fn(),
        };
        const order: string[] = [];
        const track = (name: keyof typeof outside) => () => {
            order.push(name);
            outside[name]();
        };
        const layers = [
            pushLayer(document, {
                elements: () => [dialog],
                onOutsidePress: track("dialog"),
            }),
            pushLayer(document, {
                elements: () => [popover],
                ignore: () => [popoverTrigger],
                owner: () => [popoverTrigger],
                onOutsidePress: track("popover"),
            }),
            pushLayer(document, {
                elements: () => [menu],
                ignore: () => [menuTrigger],
                owner: () => [menuTrigger],
                onOutsidePress: track("menu"),
            }),
            pushLayer(document, {
                elements: () => [select],
                ignore: () => [selectTrigger],
                owner: () => [selectTrigger],
                onOutsidePress: track("select"),
            }),
        ];
        // inside the menu: the sibling branch only, the menu's ancestors stay
        press(menu);
        expect(order).toEqual(["select"]);
        // inside the popover: the menu (below it) and the sibling branch
        order.length = 0;
        press(popover);
        expect(order).toEqual(["select", "menu"]);
        // on the menu's own trigger: inside the menu (it toggles itself)
        order.length = 0;
        press(menuTrigger);
        expect(order).toEqual(["select"]);
        // inside the dialog: every descendant, newest first
        order.length = 0;
        press(dialog);
        expect(order).toEqual(["select", "menu", "popover"]);
        // outside every layer: all of them
        order.length = 0;
        press(element());
        expect(order).toEqual(["select", "menu", "popover", "dialog"]);
        for (const layer of layers.reverse()) {
            layer.remove();
        }
    });

    it("counts a press on a layer's backdrop as outside it and inside its parent", () => {
        const first = element();
        const secondTrigger = button(first);
        const secondViewport = element();
        const second = element(secondViewport);
        const outsideFirst = vi.fn();
        const outsideSecond = vi.fn();
        const a = pushLayer(document, {
            elements: () => [first],
            onOutsidePress: outsideFirst,
        });
        const b = pushLayer(document, {
            elements: () => [second],
            backdrops: () => [secondViewport],
            owner: () => [secondTrigger],
            onOutsidePress: outsideSecond,
        });
        press(second);
        expect(outsideSecond).not.toHaveBeenCalled();
        press(secondViewport);
        expect(outsideSecond).toHaveBeenCalledTimes(1);
        expect(outsideFirst).not.toHaveBeenCalled();
        b.remove();
        a.remove();
    });

    it("ignores presses on the layer's ignored elements", () => {
        const popup = element();
        const trigger = element();
        const onOutsidePress = vi.fn();
        const layer = pushLayer(document, {
            elements: () => [popup],
            ignore: () => [trigger],
            onOutsidePress,
        });
        press(trigger);
        expect(onOutsidePress).not.toHaveBeenCalled();
        layer.remove();
    });

    it("gives elementsAbove the descendants' elements only, not a newer sibling's", () => {
        const dialog = element();
        const trigger = button(dialog);
        const popover = element();
        const sibling = element();
        const a = pushLayer(document, { elements: () => [dialog] });
        const b = pushLayer(document, {
            elements: () => [popover],
            owner: () => [trigger],
        });
        const c = pushLayer(document, { elements: () => [sibling] });
        expect(a.elementsAbove()).toEqual([popover]);
        expect(b.elementsAbove()).toEqual([]);
        expect(c.elementsAbove()).toEqual([]);
        c.remove();
        b.remove();
        a.remove();
    });

    it("re-parents a removed layer's children and tells each open descendant, newest first", () => {
        const dialog = element();
        const dialogButton = button(dialog);
        const popover = element();
        const popoverButton = button(popover);
        const menu = element();
        const closed: string[] = [];
        const a = pushLayer(document, {
            elements: () => [dialog],
            onParentClose: () => closed.push("dialog"),
        });
        const b = pushLayer(document, {
            elements: () => [popover],
            owner: () => [dialogButton],
            onParentClose: () => closed.push("popover"),
        });
        const c = pushLayer(document, {
            elements: () => [menu],
            owner: () => [popoverButton],
            onParentClose: () => closed.push("menu"),
        });
        b.remove();
        expect(closed).toEqual(["menu"]);
        // the menu now hangs from the dialog
        expect(a.elementsAbove()).toEqual([menu]);
        // the dialog closing closes the re-parented menu
        closed.length = 0;
        a.remove();
        expect(closed).toEqual(["menu"]);
        c.remove();
        // removing twice does nothing
        b.remove();
        expect(closed).toEqual(["menu"]);
    });

    it("tells every open descendant of a removed layer, newest first", () => {
        const dialog = element();
        const dialogButton = button(dialog);
        const popover = element();
        const popoverButton = button(popover);
        const closed: string[] = [];
        const a = pushLayer(document, { elements: () => [dialog] });
        const b = pushLayer(document, {
            elements: () => [popover],
            owner: () => [dialogButton],
            onParentClose: () => closed.push("popover"),
        });
        const c = pushLayer(document, {
            elements: () => [element()],
            owner: () => [popoverButton],
            onParentClose: () => closed.push("menu"),
        });
        a.remove();
        expect(closed).toEqual(["menu", "popover"]);
        c.remove();
        b.remove();
    });

    it("keeps the layers a modal layer was opened from when a press lands outside every layer", () => {
        const popover = element();
        const popoverButton = button(popover);
        const alert = element();
        const alertButton = button(alert);
        const pressed: string[] = [];
        const a = pushLayer(document, {
            elements: () => [popover],
            onOutsidePress: () => pressed.push("popover"),
        });
        const b = pushLayer(document, {
            elements: () => [alert],
            owner: () => [popoverButton],
            modal: true,
            onOutsidePress: () => pressed.push("alert"),
        });
        // a child of the modal layer (a menu opened from the dialog)
        const menu = element();
        const c = pushLayer(document, {
            elements: () => [menu],
            owner: () => [alertButton],
            onOutsidePress: () => pressed.push("menu"),
        });
        // the page is inert under the modal layer: the press lands on the body
        press(document.body);
        expect(pressed).toEqual(["menu", "alert"]);
        // a press on the layer it was opened from counts the same
        pressed.length = 0;
        press(popover);
        expect(pressed).toEqual(["menu", "alert"]);
        // a press inside the modal layer or its descendants follows the tree as usual
        pressed.length = 0;
        press(alert);
        expect(pressed).toEqual(["menu"]);
        pressed.length = 0;
        press(menu);
        expect(pressed).toEqual([]);
        c.remove();
        b.remove();
        // without the modal layer, a press outside every layer dismisses them all again
        press(document.body);
        expect(pressed).toEqual(["popover"]);
        a.remove();
    });

    it("follows the newest modal layer, and dismisses a non-descendant layer above it", () => {
        const outer = element();
        const outerButton = button(outer);
        const inner = element();
        const pressed: string[] = [];
        const a = pushLayer(document, {
            elements: () => [outer],
            modal: true,
            onOutsidePress: () => pressed.push("outer"),
        });
        const b = pushLayer(document, {
            elements: () => [inner],
            owner: () => [outerButton],
            modal: true,
            onOutsidePress: () => pressed.push("inner"),
        });
        // a root layer opened above the modal layers, from nowhere in them
        const toast = element();
        const c = pushLayer(document, {
            elements: () => [toast],
            onOutsidePress: () => pressed.push("toast"),
        });
        press(document.body);
        expect(pressed).toEqual(["toast", "inner"]);
        pressed.length = 0;
        press(toast);
        expect(pressed).toEqual(["toast", "inner"]);
        pressed.length = 0;
        // a press on the outer dialog closes the nested one only
        press(outer);
        expect(pressed).toEqual(["toast", "inner"]);
        c.remove();
        b.remove();
        pressed.length = 0;
        // the outer modal layer is a root: a press outside it dismisses it alone
        press(document.body);
        expect(pressed).toEqual(["outer"]);
        a.remove();
    });
});
