import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    output,
} from "@angular/core";
import {
    buttonAttributes,
    buttonBehaviour,
    type ChangeDetails,
    controllable,
    dataValues,
    injectHost,
    injectRovingItem,
    ownAttribute,
    TOGGLE_GROUP,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface ToggleState {
    pressed: boolean;
    disabled: boolean;
}

/**
 * A two-state button (spec/toggle.md, the APG's toggle button) on the consumer's own element:
 * `<button toggle [(pressed)]="bold">`, or another element with the keys a native button has:
 * `<span toggle [nativeButton]="false">`. Button's behaviour and `aria-pressed`; inside a
 * `[toggleGroup]` one of the group's values, and inside a roving-focus scope (a ToggleGroup's, a
 * Toolbar's) one of its items.
 */
@Directive({
    selector: "[toggle]",
    exportAs: "toggle",
    host: {
        "data-primitives-part": "toggle-root",
        "[attr.type]": "attributes().type",
        "[attr.role]": "attributes().role",
        "[attr.disabled]": "attributes().disabled",
        "[attr.aria-disabled]": "attributes()['aria-disabled']",
        "[attr.tabindex]": "attributes().tabindex",
        "[attr.aria-pressed]": "state().pressed ? 'true' : 'false'",
        "[attr.data-pressed]": "data().pressed",
        "[attr.data-disabled]": "data().disabled",
        "(click)": "press($event)",
    },
})
export class Toggle {
    /** Whether it is pressed (controlled); ignored inside a ToggleGroup. */
    readonly pressed = input<boolean | undefined>(undefined);
    readonly pressedChange = output<boolean>();
    /** Pressed at first (default `false`); ignored inside a ToggleGroup. */
    readonly defaultPressed = input(false, { transform: booleanAttribute });
    /** Every press, before a group's `(valueChangeDetails)` (reason `none`). */
    readonly pressedChangeDetails = output<ValueChangeEvent<boolean>>();
    /** Its value in a ToggleGroup (required there). */
    readonly value = input<string | undefined>(undefined);
    /** It ignores presses and keys. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /**
     * Whether the element is a native `<button>` (default `true`). `false` on another element: the
     * Toggle adds `role="button"`, the tab order and the keys.
     */
    readonly nativeButton = input(true, { transform: booleanAttribute });

    private readonly group = inject(TOGGLE_GROUP, { optional: true });
    // a disabled Toggle is natively disabled: it cannot take focus (Base UI)
    private readonly item = injectRovingItem(() => !this.isDisabled());
    private readonly own = controllable<boolean, ChangeDetails>(
        this.pressed,
        this.pressedChange,
        () => this.defaultPressed(),
        (value, details) => this.pressedChangeDetails.emit({ value, details }),
    );
    private readonly isDisabled = computed(
        () =>
            this.disabled() ||
            (this.group?.disabled() ?? false) ||
            (this.item?.scope()?.disabled() ?? false),
    );
    private readonly ownTabIndex = ownAttribute("tabindex");

    readonly state = computed<ToggleState>(() => {
        const group = this.group;
        const value = this.value();
        return {
            pressed:
                group === null
                    ? this.own.value()
                    : value !== undefined && group.value().includes(value),
            disabled: this.isDisabled(),
        };
    });
    protected readonly attributes = computed(() => {
        const nativeButton = this.nativeButton();
        return buttonAttributes({
            disabled: this.isDisabled(),
            focusableWhenDisabled: false,
            nativeButton,
            // a Toggle never submits a form
            type: nativeButton ? "button" : undefined,
            tabIndex: this.item?.tabIndex() ?? this.ownTabIndex,
        });
    });
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        buttonBehaviour(injectHost(), {
            disabled: this.isDisabled,
            nativeButton: this.nativeButton,
            composite: () => this.item?.scope()?.keydown ?? null,
        });
    }

    protected press(event: Event): void {
        if (this.isDisabled()) {
            return;
        }
        const next = !this.state().pressed;
        const details: ChangeDetails = { reason: "none", event };
        const group = this.group;
        if (group === null) {
            this.own.set(next, details);
            return;
        }
        this.pressedChange.emit(next);
        this.pressedChangeDetails.emit({ value: next, details });
        const value = this.value();
        if (value !== undefined) {
            group.setPressed(value, next, details);
        }
    }
}
