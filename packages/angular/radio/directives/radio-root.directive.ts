import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    createHiddenInput,
    dataValues,
    injectEnclosing,
    injectHost,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";
import { RadioGroup } from "@fragiola/primitives-angular/radio-group";

export interface RadioState {
    checked: boolean;
    disabled: boolean;
    required: boolean;
}

/** `data-checked` / `data-unchecked` (exactly one), `data-disabled` (spec/radio-group.md). */
export function radioAttributes(state: RadioState) {
    return dataValues({
        checked: state.checked,
        unchecked: !state.checked,
        disabled: state.disabled,
    });
}

/**
 * A `radio` of a `[radioGroup]`, with its hidden form input rendered right after it
 * (spec/radio-group.md): `<button radioRoot value="pro"><span *radioIndicator></span></button>`.
 * A press (or a press on its label) checks and focuses it; the arrows move through the group.
 */
@Directive({
    selector: "[radioRoot]",
    exportAs: "radioRoot",
    host: {
        type: "button",
        role: "radio",
        "data-primitives-part": "radio-root",
        "[attr.id]": "id() ?? null",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-checked]": "state().checked ? 'true' : 'false'",
        "[attr.tabindex]": "holdsTabStop() ? 0 : -1",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-required]": "state().required ? '' : null",
        "(click)": "onClick()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class RadioRoot {
    /** Its value in the group. */
    readonly value = input.required<string>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly id = input<string | undefined>(undefined);

    private readonly group = injectEnclosing(
        RadioGroup,
        "radioGroup",
        "radioRoot",
    );
    private readonly host = injectHost<HTMLButtonElement>();
    private readonly hidden = createHiddenInput(this.host, {
        type: "radio",
        "data-primitives-part": "radio-input",
    });
    readonly state = computed<RadioState>(() => ({
        checked: this.group.checked() === this.value(),
        disabled: this.disabled() || this.group.isDisabled(),
        required: this.group.required(),
    }));
    protected readonly data = computed(() => radioAttributes(this.state()));
    /** The roving tab stop: before the radios registered, the checked one. */
    protected readonly holdsTabStop = computed(
        () => this.group.tabStop() === this.value() && !this.state().disabled,
    );

    constructor() {
        const host = this.host;
        const hidden = this.hidden;
        const group = this.group;
        effect((onCleanup) => {
            const entry = {
                value: this.value(),
                disabled: this.state().disabled,
                element: host,
                input: hidden,
            };
            onCleanup(untracked(() => group.register(entry)));
        });
        effect(() => {
            const state = this.state();
            setInputAttribute(hidden, "name", group.formName() ?? null);
            hidden.value = this.value();
            hidden.checked = state.checked;
            hidden.required = state.required;
            hidden.disabled = state.disabled;
        });

        const destroyRef = inject(DestroyRef);
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                // every radio of the group reports the reset; the group returns to its default once
                reset: () => {
                    group.reset();
                    // the browser reset the input after the state: write the state back
                    hidden.checked = untracked(this.state).checked;
                },
                invalid: () => group.tabStopElement(),
            });
        });
        destroyRef.onDestroy(() => stop?.());
    }

    protected onClick(): void {
        if (this.state().disabled) {
            return;
        }
        // a press on its label checks and focuses it
        this.host.focus();
        this.group.select(this.value());
    }

    protected onKeyDown(event: KeyboardEvent): void {
        // a native radio does not check on Enter (a button would click)
        if (event.key === "Enter") {
            event.preventDefault();
            return;
        }
        if (this.group.navigate(event.key, this.host)) {
            event.preventDefault();
        }
    }
}
