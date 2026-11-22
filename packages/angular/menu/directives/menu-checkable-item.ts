import { DestroyRef, inject } from "@angular/core";
import { injectFlush } from "@fragiola/primitives-angular/internal";
import type { MenuRootBase } from "./menu-root-base.ts";

/** The state a CheckboxItem or a RadioItem gives its indicator. */
export interface MenuCheckableItemState {
    checked: boolean;
    highlighted: boolean;
    disabled: boolean;
}

/** The `data-checked` / `data-unchecked` pair of a checkable item and its indicator. */
export function checkedAttributes(state: MenuCheckableItemState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        highlighted: state.highlighted,
        disabled: state.disabled,
    };
}

/**
 * The activation of a CheckboxItem or a RadioItem (spec/menu.md, "Activating a checkable item"), in
 * its directive's injection context: Space and Enter fire its `click`; the click changes the state,
 * then Enter closes every level, Space keeps them open, and a pointer click closes them only with
 * `closeOnClick`. A disabled item's click stops before the consumer's own `(click)`.
 */
export function checkableActivation(
    level: MenuRootBase,
    host: HTMLElement,
    options: {
        disabled: () => boolean;
        closeOnClick: () => boolean;
        change: (event: Event) => void;
    },
) {
    const flush = injectFlush();
    let key: "Enter" | " " | null = null;
    const stopDisabled = (event: Event) => {
        if (options.disabled()) {
            event.stopImmediatePropagation();
        }
    };
    // at the target, capturing listeners run before the consumer's `(click)`
    host.addEventListener("click", stopDisabled, { capture: true });
    inject(DestroyRef).onDestroy(() =>
        host.removeEventListener("click", stopDisabled, { capture: true }),
    );
    return {
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }
            // the popup's own activation stays out of it
            event.preventDefault();
            key = event.key;
            host.click();
            key = null;
        },
        onClick: (event: MouseEvent) => {
            if (options.disabled()) {
                return;
            }
            options.change(event);
            const pressed = key;
            if (
                pressed === "Enter" ||
                (pressed === null && options.closeOnClick())
            ) {
                level.closeAll("item-press", event);
            }
            // the new state reaches the DOM before the next key
            flush();
        },
    };
}

/** `*menuCheckboxItemIndicator="{ keepMounted: true }"`; `true` too; alone (`""`): not kept. */
export function indicatorOptions(value: unknown): { keepMounted: boolean } {
    if (value === true || value === "true") {
        return { keepMounted: true };
    }
    return {
        keepMounted:
            typeof value === "object" &&
            value !== null &&
            (value as { keepMounted?: unknown }).keepMounted === true,
    };
}
