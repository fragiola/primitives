import { afterNextRender, DestroyRef, inject } from "@angular/core";
import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";

/**
 * A form control's hidden input (spec/README.md, "Forms"), created by the directive itself: a
 * root on an `<ng-container>` has no element to render it in, and a part on the consumer's own
 * element (the checkbox's `<button>`) cannot add a sibling from a template. It goes right after
 * `anchor` (the container's comment, or the host element), as React renders it after its part,
 * with the structural hidden style unless it is `type="hidden"`; it is removed with the directive.
 * It is inserted after the first render (Epic #22: server rendering and hydration).
 */
export function createHiddenInput(
    anchor: Node,
    attributes: Record<string, string>,
): HTMLInputElement {
    const input = (anchor.ownerDocument ?? document).createElement("input");
    for (const [name, value] of Object.entries(attributes)) {
        input.setAttribute(name, value);
    }
    if (input.type !== "hidden") {
        input.setAttribute("aria-hidden", "true");
        input.tabIndex = -1;
        Object.assign(input.style, VISUALLY_HIDDEN_INPUT_STYLE);
    }
    // after the render, never during it: a hydration walks the server's DOM as its template has
    // it, and a node inserted on the way breaks it (NG0502). So the server renders none (an after
    // render hook never runs there), and the browser inserts it once its view is in the page (a
    // view inside an `@if` is attached after its directives are made)
    afterNextRender(() => {
        if (!input.isConnected) {
            anchor.parentNode?.insertBefore(input, anchor.nextSibling);
        }
    });
    inject(DestroyRef).onDestroy(() => input.remove());
    return input;
}

/** Sets or removes an attribute of the hidden input (`null` removes it). */
export function setInputAttribute(
    input: HTMLInputElement,
    name: string,
    value: string | null,
): void {
    if (value === null) {
        input.removeAttribute(name);
    } else {
        input.setAttribute(name, value);
    }
}
