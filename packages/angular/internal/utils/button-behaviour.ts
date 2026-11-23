import { afterNextRender, DestroyRef, inject } from "@angular/core";

export type ButtonType = "button" | "submit" | "reset";

export interface ButtonOptions {
    disabled: boolean;
    focusableWhenDisabled: boolean;
    nativeButton: boolean;
    type: ButtonType | undefined;
    /** The consumer's own `tabindex` (or a composite's roving one), or `null`. */
    tabIndex: string | null;
}

/** A button's attributes (spec/button.md, "State attributes and ARIA"); `null` removes one. */
export function buttonAttributes(options: ButtonOptions) {
    const { disabled, focusableWhenDisabled, nativeButton, type, tabIndex } =
        options;
    if (nativeButton) {
        return {
            type: type ?? "button",
            role: null,
            disabled: disabled && !focusableWhenDisabled ? "" : null,
            "aria-disabled": disabled && focusableWhenDisabled ? "true" : null,
            tabindex: tabIndex,
        };
    }
    return {
        type: type ?? null,
        role: "button",
        disabled: null,
        "aria-disabled": disabled ? "true" : null,
        tabindex: !disabled || focusableWhenDisabled ? (tabIndex ?? "0") : "-1",
    };
}

/**
 * What a non-native button does with a key a native button would act on (spec/button.md,
 * "Keyboard"): Enter clicks on its key down; Space only prevents its key down (no scroll) and
 * clicks on its key up. `null` for any other key.
 */
export function nativeKeyAction(
    type: "keydown" | "keyup",
    key: string,
): "click" | "prevent" | "click-on-keyup" | null {
    if (type === "keydown") {
        if (key === "Enter") {
            return "click";
        }
        return key === " " ? "prevent" : null;
    }
    return key === " " ? "click-on-keyup" : null;
}

/** The keys a roving composite acts on (spec/toolbar.md, "Keyboard"). */
const COMPOSITE_KEYS: readonly string[] = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
];

/** The events a disabled button keeps from the consumer's handlers (spec/button.md, "Pointer"). */
const GUARDED = ["click", "mousedown", "pointerdown", "keydown", "keyup"];

export interface ButtonBehaviourOptions {
    disabled: () => boolean;
    nativeButton: () => boolean;
    /**
     * An item of a roving composite (a toolbar's button, a Toggle in a group): while disabled and
     * focusable, the composite's keys still reach the composite (spec/toolbar.md, "Disabled
     * items"), handed to it here since the consumer's handlers are stopped. `null` outside one.
     */
    composite?: () => ((event: KeyboardEvent) => void) | null;
}

/**
 * A button's behaviour on its host (spec/button.md), shared by Button, Toggle and
 * Toolbar.Button (the package's own code, not the `/button` entry), in an injection context.
 * While disabled, no press, pointer down or key but Tab reaches the consumer's handlers: a
 * capturing listener on the element stops them first. A non-native button gets the keys a
 * native button has, after the consumer's own handlers.
 */
export function buttonBehaviour(
    host: HTMLElement,
    options: ButtonBehaviourOptions,
): void {
    const guard = (event: Event) => {
        if (!options.disabled()) {
            return;
        }
        if (event instanceof KeyboardEvent && event.key === "Tab") {
            return;
        }
        const composite =
            event instanceof KeyboardEvent &&
            event.type === "keydown" &&
            COMPOSITE_KEYS.includes(event.key)
                ? (options.composite?.() ?? null)
                : null;
        event.stopImmediatePropagation();
        if (composite !== null) {
            composite(event as KeyboardEvent);
            return;
        }
        // a focusable disabled submit button does not submit, on a press or on Enter
        if (event.type !== "mousedown" && event.type !== "keyup") {
            event.preventDefault();
        }
    };
    // at the target, capturing listeners run before the consumer's own `(click)`
    for (const type of GUARDED) {
        host.addEventListener(type, guard, { capture: true });
    }

    // a non-native button's keys, after the consumer's own handlers (registered with the
    // template, before this runs), so one that prevents the key's default keeps it
    const onKey = (event: KeyboardEvent) => {
        if (
            options.nativeButton() ||
            event.defaultPrevented ||
            event.target !== event.currentTarget
        ) {
            return;
        }
        const action = nativeKeyAction(
            event.type as "keydown" | "keyup",
            event.key,
        );
        if (action === "prevent") {
            event.preventDefault();
        } else if (action !== null) {
            event.preventDefault();
            host.click();
        }
    };
    afterNextRender(() => {
        host.addEventListener("keydown", onKey);
        host.addEventListener("keyup", onKey);
    });
    inject(DestroyRef).onDestroy(() => {
        for (const type of GUARDED) {
            host.removeEventListener(type, guard, { capture: true });
        }
        host.removeEventListener("keydown", onKey);
        host.removeEventListener("keyup", onKey);
    });
}
