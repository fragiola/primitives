import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    output,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    dataValues,
    injectHost,
    injectId,
    setInputAttribute,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface SwitchState {
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** `data-checked` / `data-unchecked` (exactly one), and the switch's flags (spec/switch.md). */
export function switchAttributes(state: SwitchState) {
    return dataValues({
        checked: state.checked,
        unchecked: !state.checked,
        disabled: state.disabled,
        readonly: state.readOnly,
        required: state.required,
    });
}

/**
 * A `switch` with its hidden form inputs, rendered right after it (spec/switch.md, the APG
 * switch): `<button switchRoot [(checked)]="wifi" name="wifi"><span switchThumb></span></button>`.
 * Space and Enter click the native button: both toggle.
 */
@Directive({
    selector: "[switchRoot]",
    exportAs: "switchRoot",
    host: {
        type: "button",
        role: "switch",
        "data-primitives-part": "switch-root",
        "[attr.id]": "resolvedId()",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-checked]": "state().checked ? 'true' : 'false'",
        "[attr.aria-required]": "state().required ? 'true' : null",
        "[attr.aria-readonly]": "state().readOnly ? 'true' : null",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "(click)": "toggle()",
        "(focus)": "field.focused()",
        "(blur)": "field.blurred()",
    },
})
export class SwitchRoot {
    readonly checked = input<boolean | undefined>(undefined);
    readonly checkedChange = output<boolean>();
    readonly defaultChecked = input(false, { transform: booleanAttribute });
    readonly checkedChangeDetails = output<ValueChangeEvent<boolean>>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });
    /** Focusable and submitted, but a press or a key does not toggle it. */
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** Submitted while on (`"on"`). */
    readonly value = input("on");
    /** Submitted while off, when given (Base UI); nothing is submitted while off without it. */
    readonly uncheckedValue = input<string | undefined>(undefined);
    readonly id = input<string | undefined>(undefined);

    private readonly host = injectHost<HTMLButtonElement>();
    private readonly generatedId = injectId("primitives-switch");
    protected readonly resolvedId = computed(
        () => this.id() ?? this.generatedId,
    );
    private readonly hidden = createHiddenInput(this.host, {
        type: "checkbox",
        "data-primitives-part": "switch-input",
    });
    private readonly own = controllable<boolean, ChangeDetails>(
        this.checked,
        this.checkedChange,
        () => this.defaultChecked(),
        (value, details) => this.checkedChangeDetails.emit({ value, details }),
    );
    protected readonly field = fieldControl({
        id: this.resolvedId,
        labelable: true,
        value: this.own.value,
        filled: this.own.value,
        input: () => this.hidden,
        focusTarget: () => this.host,
    });
    readonly state = computed<SwitchState>(() => ({
        checked: this.own.value(),
        disabled: this.disabled() || this.field.disabled(),
        readOnly: this.readOnly(),
        required: this.required(),
    }));
    protected readonly data = computed(() => switchAttributes(this.state()));

    constructor() {
        const host = this.host;
        const hidden = this.hidden;
        writeFieldAria(this.field, host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
        const formName = computed(
            () => this.field.name() ?? this.name() ?? null,
        );
        effect(() => {
            const state = this.state();
            setInputAttribute(hidden, "name", formName());
            hidden.value = this.value();
            hidden.checked = state.checked;
            hidden.required = state.required;
            hidden.disabled = state.disabled;
        });

        // the unchecked input, right after the hidden one, only while off with `uncheckedValue`:
        // inserted after the render, never on a server nor during a hydration (as the hidden one)
        const unchecked = host.ownerDocument.createElement("input");
        unchecked.type = "hidden";
        unchecked.setAttribute(
            "data-primitives-part",
            "switch-unchecked-input",
        );
        const uncheckedValue = this.uncheckedValue;
        afterRenderEffect({
            write: () => {
                const value = uncheckedValue();
                const state = this.state();
                const name = formName();
                if (state.checked || value === undefined) {
                    unchecked.remove();
                    return;
                }
                setInputAttribute(unchecked, "name", name);
                unchecked.value = value;
                unchecked.disabled = state.disabled;
                if (!hidden.isConnected) {
                    host.parentNode?.insertBefore(hidden, host.nextSibling);
                }
                if (unchecked.previousSibling !== hidden) {
                    hidden.parentNode?.insertBefore(
                        unchecked,
                        hidden.nextSibling,
                    );
                }
            },
        });

        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(() => unchecked.remove());
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    this.field.reset();
                    this.own.set(this.defaultChecked(), { reason: "none" });
                    // the browser reset the input after the state: write the state back
                    hidden.checked = untracked(this.state).checked;
                },
                invalid: () => host,
            });
        });
        destroyRef.onDestroy(() => stop?.());
    }

    protected toggle(): void {
        const state = this.state();
        if (state.disabled || state.readOnly) {
            return;
        }
        this.own.set(!state.checked, { reason: "none" });
    }
}
