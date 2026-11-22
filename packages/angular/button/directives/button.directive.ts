import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
} from "@angular/core";
import {
    dataValues,
    injectHost,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";

export interface ButtonState {
    disabled: boolean;
}

export type ButtonType = "button" | "submit" | "reset";

export interface ButtonOptions {
    disabled: boolean;
    focusableWhenDisabled: boolean;
    nativeButton: boolean;
    type: ButtonType | undefined;
    /** The consumer's own `tabindex`, or `null`. */
    tabIndex: string | null;
}

/** A Button's attributes (spec/button.md, "State attributes and ARIA"); `null` removes one. */
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
 * What a non-native Button does with a key a native button would act on (spec/button.md,
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

/** The events a disabled Button keeps from the consumer's handlers (spec/button.md, "Pointer"). */
const GUARDED = ["click", "mousedown", "pointerdown", "keydown", "keyup"];

/**
 * An element that performs an action (spec/button.md, the APG button), on the consumer's own
 * element: `<button button (click)="save()">`, or another element with the keys a native button
 * has: `<span button [nativeButton]="false">`. While disabled, no press, pointer down or key but
 * Tab reaches the consumer's handlers: a capturing listener on the element stops them first.
 */
@Directive({
    selector: "[button]",
    exportAs: "button",
    host: {
        "data-primitives-part": "button-root",
        "[attr.type]": "attributes().type",
        "[attr.role]": "attributes().role",
        "[attr.disabled]": "attributes().disabled",
        "[attr.aria-disabled]": "attributes()['aria-disabled']",
        "[attr.tabindex]": "attributes().tabindex",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class Button {
    /** The button ignores presses and keys. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** A disabled button stays in the tab order and focusable (Base UI). */
    readonly focusableWhenDisabled = input(false, {
        transform: booleanAttribute,
    });
    /**
     * Whether the element is a native `<button>` (default `true`). `false` on another element: the
     * Button adds `role="button"`, the tab order and the keys.
     */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    /** A native Button is `type="button"` unless given. */
    readonly type = input<ButtonType | undefined>(undefined);

    private readonly ownTabIndex = ownAttribute("tabindex");
    readonly state = computed<ButtonState>(() => ({
        disabled: this.disabled(),
    }));
    protected readonly attributes = computed(() =>
        buttonAttributes({
            disabled: this.disabled(),
            focusableWhenDisabled: this.focusableWhenDisabled(),
            nativeButton: this.nativeButton(),
            type: this.type(),
            tabIndex: this.ownTabIndex,
        }),
    );
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const host = injectHost();
        const guard = (event: Event) => {
            if (!this.disabled()) {
                return;
            }
            if (event instanceof KeyboardEvent && event.key === "Tab") {
                return;
            }
            // a focusable disabled submit button does not submit, on a press or on Enter
            if (event.type !== "mousedown" && event.type !== "keyup") {
                event.preventDefault();
            }
            event.stopImmediatePropagation();
        };
        // at the target, capturing listeners run before the consumer's own `(click)`
        for (const type of GUARDED) {
            host.addEventListener(type, guard, { capture: true });
        }

        // a non-native button's keys, after the consumer's own handlers (registered with the
        // template, before this runs), so one that prevents the key's default keeps it
        const onKey = (event: KeyboardEvent) => {
            if (
                this.nativeButton() ||
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
}
