import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    dataValues,
    injectFlush,
    injectId,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** What starts an edit on the Preview (spec/editable.md, "API"). */
export type EditableActivationMode = "focus" | "click" | "dblclick" | "none";

/** What commits an edit. */
export type EditableSubmitMode = "enter" | "blur" | "both" | "none";

/** The state every part renders with. */
export interface EditableState {
    value: string;
    editing: boolean;
    empty: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** An optional number input: `maxLength="12"` and `[maxLength]="12"` give `12`. */
function optionalNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    const number = numberAttribute(value);
    return Number.isNaN(number) ? undefined : number;
}

/**
 * Holds an Editable's value and its edit (spec/editable.md, Zag's and Reka's inline edit): `<div
 * editableRoot [(value)]="title" (valueCommit)="save($event)">` around its Area (Preview, Input)
 * and its triggers. Every part carries its state (`data-editing`, `data-empty`, `data-disabled`,
 * `data-readonly`, `data-required`); the Root also the Field's.
 */
@Directive({
    selector: "[editableRoot]",
    exportAs: "editableRoot",
    host: {
        "data-primitives-part": "editable-root",
        "[attr.data-editing]": "data().editing",
        "[attr.data-empty]": "data().empty",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-readonly]": "data().readonly",
        "[attr.data-required]": "data().required",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "(focusout)": "onFocusOut($event)",
    },
})
export class EditableRoot {
    /** The bound text (`[(value)]`); `value()` is the current one. */
    readonly boundValue = input<string | undefined>(undefined, {
        alias: "value",
    });
    readonly valueChange = output<string>();
    readonly defaultValue = input("");
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    /** An edit ended by committing, with its value. */
    readonly valueCommit = output<ValueChangeEvent<string>>();
    /** An edit ended by reverting, with the value it went back to. */
    readonly valueRevert = output<ValueChangeEvent<string>>();
    /** What starts an edit on the Preview (default `"focus"`). */
    readonly activationMode = input<EditableActivationMode>("focus");
    /** What commits an edit (default `"both"`). */
    readonly submitMode = input<EditableSubmitMode>("both");
    /** The Preview's text while empty, and the Input's placeholder. */
    readonly placeholder = input<string | undefined>(undefined);
    readonly maxLength = input(undefined, { transform: optionalNumber });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The Input's `id` (bind it, `[id]="'title'"`: a static one also lands on the Root). */
    readonly id = input<string | undefined>(undefined);

    private readonly flush = injectFlush();
    private readonly generatedId = injectId("primitives-editable");
    /** The Input's `id`. */
    readonly inputId = computed(() => this.id() ?? this.generatedId);
    readonly inputElement = signal<HTMLInputElement | null>(null);
    readonly previewElement = signal<HTMLElement | null>(null);
    readonly editTriggerElement = signal<HTMLElement | null>(null);
    readonly submitTriggerElement = signal<HTMLElement | null>(null);
    readonly cancelTriggerElement = signal<HTMLElement | null>(null);
    private readonly text = controllable<string, ChangeDetails>(
        this.boundValue,
        this.valueChange,
        () => this.defaultValue(),
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    /** The text. */
    readonly value = this.text.value;
    /** Whether an edit runs. */
    readonly editing = signal(false);
    /** The enclosing field's binding, for the Input (spec/field.md). */
    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: this.value,
        filled: computed(() => this.value() !== ""),
        input: () => this.inputElement(),
        focusTarget: () => this.focusTarget(),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    readonly interactive = computed(
        () => !this.isDisabled() && !this.readOnly(),
    );
    /** The Input's form name: the field's, else its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    readonly state = computed<EditableState>(() => ({
        value: this.value(),
        editing: this.editing(),
        empty: this.value() === "",
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
    }));
    /** The state attributes, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            editing: state.editing,
            empty: state.empty,
            disabled: state.disabled,
            readonly: state.readOnly,
            required: state.required,
        });
    });
    /** The Preview shows the placeholder. */
    readonly showsPlaceholder = computed(
        () => this.value() === "" && this.placeholder() !== undefined,
    );
    /** The value an edit started from, which a revert goes back to. */
    private start = "";
    /** The Preview takes the focus back after an edit: that focus starts no edit. */
    private returning = false;

    /** The Input while editing, else the Preview (spec/editable.md, "Forms"). */
    focusTarget(): HTMLElement | null {
        return untracked(this.editing)
            ? untracked(this.inputElement)
            : untracked(this.previewElement);
    }

    /** Starts an edit: the Input focused, its text selected. */
    edit(): void {
        if (!untracked(this.interactive) || untracked(this.editing)) {
            return;
        }
        this.start = untracked(this.value);
        this.editing.set(true);
        this.flush();
        const element = untracked(this.inputElement);
        element?.focus();
        element?.select();
    }

    /** The Preview took the focus: starts an edit in `"focus"` mode, unless it is a focus return. */
    previewFocused(): void {
        if (!this.returning && untracked(this.activationMode) === "focus") {
            this.edit();
        }
    }

    /** Ends the edit; with `returnFocus`, the focus goes to the EditTrigger, else the Preview. */
    private leave(returnFocus: boolean): void {
        this.editing.set(false);
        this.flush();
        if (!returnFocus) {
            return;
        }
        const edit = untracked(
            this.editTriggerElement,
        ) as HTMLButtonElement | null;
        if (edit !== null && !edit.hidden && !edit.disabled) {
            edit.focus();
            return;
        }
        const preview = untracked(this.previewElement);
        if (preview !== null) {
            this.returning = true;
            preview.focus();
            this.returning = false;
        }
    }

    private end(
        commit: boolean,
        reason: ChangeReason,
        event: Event | undefined,
        returnFocus: boolean,
    ): void {
        if (!untracked(this.editing)) {
            return;
        }
        const details = { reason, event };
        if (commit) {
            const value = untracked(this.value);
            this.leave(returnFocus);
            this.valueCommit.emit({ value, details });
            return;
        }
        this.text.set(this.start, details);
        this.leave(returnFocus);
        this.valueRevert.emit({ value: this.start, details });
    }

    commit(reason: "keyboard" | "submit-press", event: Event): void {
        this.end(true, reason, event, true);
    }

    revert(reason: "escape-key" | "cancel-press", event: Event): void {
        this.end(false, reason, event, true);
    }

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

    /** The focus left a part: the edit ends once it is outside the Input and its triggers. */
    protected onFocusOut(event: FocusEvent): void {
        if (!untracked(this.editing)) {
            return;
        }
        const related = event.relatedTarget as Node | null;
        const parts = [
            untracked(this.inputElement),
            untracked(this.submitTriggerElement),
            untracked(this.cancelTriggerElement),
        ];
        // only the edit's own parts end it: the EditTrigger or the Preview losing the focus as the
        // edit starts (hidden while focused, the browser blurs it) is none
        if (!parts.some((part) => part !== null && part === event.target)) {
            return;
        }
        for (const part of parts) {
            if (part !== null && related !== null && part.contains(related)) {
                return;
            }
        }
        const target = event.target as Element;
        if (related === null && !target.ownerDocument.hasFocus()) {
            // the window lost the focus: the edit goes on
            return;
        }
        const mode = untracked(this.submitMode);
        this.end(
            mode === "blur" || mode === "both",
            "input-blur",
            event,
            related === null,
        );
    }

    /** A form reset: ends an edit, the default value (spec/editable.md, "Forms"). */
    reset(): void {
        if (untracked(this.editing)) {
            const input = untracked(this.inputElement);
            const active = input?.ownerDocument.activeElement ?? null;
            const inEdit =
                active !== null &&
                [
                    input,
                    untracked(this.submitTriggerElement),
                    untracked(this.cancelTriggerElement),
                ].includes(active as HTMLElement);
            this.field.reset();
            this.text.set(this.defaultValue(), { reason: "none" });
            this.leave(inEdit);
        } else {
            this.field.reset();
            this.text.set(this.defaultValue(), { reason: "none" });
            this.flush();
        }
        const element = untracked(this.inputElement);
        if (element !== null) {
            element.value = untracked(this.value);
        }
    }
}
