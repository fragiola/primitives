import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectFlush,
    injectId,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The state every part renders with (spec/password-input.md, "API"). */
export interface PasswordInputState {
    value: string;
    visible: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** What `(visibleChangeDetails)` emits: the new visibility and why. */
export interface PasswordInputVisibleChangeEvent {
    visible: boolean;
    details: ChangeDetails;
}

/**
 * Holds a PasswordInput's text and whether it is shown (spec/password-input.md): `<div
 * passwordInputRoot [(value)]="password" name="password">` around its Input and its
 * VisibilityTrigger. Every part carries its state (`data-visible`, `data-disabled`,
 * `data-readonly`, `data-required`); the Root also the Field's.
 */
@Directive({
    selector: "[passwordInputRoot]",
    exportAs: "passwordInputRoot",
    host: {
        "data-primitives-part": "password-input-root",
        "[attr.data-visible]": "data().visible",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
    },
})
export class PasswordInputRoot {
    /** The bound text (`[(value)]`); `value()` is the current one. */
    readonly boundValue = input<string | undefined>(undefined, {
        alias: "value",
    });
    readonly valueChange = output<string>();
    readonly defaultValue = input("");
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    /** Whether the text is shown (`[(visible)]`); `visible()` is the current one. */
    readonly boundVisible = input<boolean | undefined>(undefined, {
        alias: "visible",
    });
    readonly visibleChange = output<boolean>();
    readonly defaultVisible = input(false, { transform: booleanAttribute });
    readonly visibleChangeDetails = output<PasswordInputVisibleChangeEvent>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The Input's `id` (bind it, `[id]="'password'"`: a static one also lands on the Root). */
    readonly id = input<string | undefined>(undefined);

    private readonly flush = injectFlush();
    private readonly generatedId = injectId("primitives-password-input");
    /** The Input's `id`. */
    readonly inputId = computed(() => this.id() ?? this.generatedId);
    /** The Input's element, once rendered. */
    readonly inputElement = signal<HTMLInputElement | null>(null);
    private readonly text = controllable<string, ChangeDetails>(
        this.boundValue,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    private readonly shown = controllable<boolean, ChangeDetails>(
        this.boundVisible,
        this.visibleChange,
        () => this.defaultVisible(),
        (visible, details) =>
            this.visibleChangeDetails.emit({ visible, details }),
    );
    /** The text. */
    readonly value = this.text.value;
    /** Whether the text is shown. */
    readonly visible = this.shown.value;
    /** The enclosing field's binding, for the Input (spec/field.md). */
    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: this.value,
        filled: computed(() => this.value() !== ""),
        input: () => this.inputElement(),
        focusTarget: () => this.inputElement(),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The Input's form name: the field's, else its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    readonly state = computed<PasswordInputState>(() => ({
        value: this.value(),
        visible: this.visible(),
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
    }));
    /** The state attributes, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            visible: state.visible,
            disabled: state.disabled,
            readonly: state.readOnly,
            required: state.required,
        });
    });

    /** The Input's text changed; a bound value the consumer kept is put back. */
    type(text: string, event: Event): void {
        this.text.set(text, { reason: "input-change", event });
        this.flush();
        const element = untracked(this.inputElement);
        const kept = untracked(this.value);
        if (element !== null && element.value !== kept) {
            element.value = kept;
        }
    }

    /**
     * The VisibilityTrigger's press: the type changes at once, and the Input's selection is put
     * back as it was (spec/password-input.md, "Focus").
     */
    toggle(event: Event): void {
        if (untracked(this.isDisabled)) {
            return;
        }
        const element = untracked(this.inputElement);
        const selection =
            element === null
                ? null
                : {
                      start: element.selectionStart,
                      end: element.selectionEnd,
                      direction: element.selectionDirection,
                  };
        this.shown.set(!untracked(this.visible), {
            reason: "trigger-press",
            event,
        });
        this.flush();
        if (
            element !== null &&
            selection !== null &&
            selection.start !== null
        ) {
            element.setSelectionRange(
                selection.start,
                selection.end ?? selection.start,
                selection.direction ?? undefined,
            );
        }
    }

    /** A form submission hides the text (spec/password-input.md, "Forms"). */
    hide(event: Event): void {
        if (untracked(this.visible)) {
            this.shown.set(false, { reason: "none", event });
            this.flush();
        }
    }

    /** A form reset: the default text, the default visibility. */
    reset(): void {
        this.field.reset();
        this.text.set(this.defaultValue(), { reason: "none" });
        this.shown.set(this.defaultVisible(), { reason: "none" });
        this.flush();
        const element = untracked(this.inputElement);
        if (element !== null) {
            element.value = untracked(this.value);
        }
    }
}
