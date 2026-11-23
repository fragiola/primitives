import {
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    signal,
    untracked,
} from "@angular/core";
import {
    createFieldValidator,
    type FieldState,
    type FieldValidate,
    type FieldValidation,
    type FieldValidationMode,
    fieldDescribedBy,
    fieldStateAttributes,
    formErrorsFor,
    shownAfterChange,
    UNVALIDATED,
    validatesOnChange,
} from "@fragiola/primitives/form";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { FIELDSET_CONTEXT } from "../utils/fieldset-context.ts";
import { FORM_CONTEXT } from "../utils/form-context.ts";

/** What a control inside the field reports (spec/field.md, "Integration contract"). */
export interface FieldControlEvents {
    /**
     * The control mounted, or its form was reset (no change: spec/form.md): its value, whether it
     * is filled. Sets the custom validity, shows nothing.
     */
    mounted: (
        input: HTMLInputElement | null,
        value: unknown,
        filled: boolean,
    ) => void;
    changed: (
        input: HTMLInputElement | null,
        value: unknown,
        dirty: boolean,
        filled: boolean,
    ) => void;
    focused: () => void;
    blurred: (input: HTMLInputElement | null, value: unknown) => void;
    /**
     * A submission attempt: validates and shows the result; returns whether the field is invalid
     * now (a pending async run counts as not invalid).
     */
    submitAttempt: (input: HTMLInputElement | null, value: unknown) => boolean;
}

/** The control's side of the field: what it registers (spec/field.md, "Integration contract"). */
export interface FieldControlEntry {
    /** The element the form validates, and the control's value. */
    input: () => HTMLInputElement | null;
    value: () => unknown;
    /** The element a Form focuses (spec/field.md item 5). */
    focusTarget: () => HTMLElement | null;
}

/**
 * Holds the field's state, validation and ids (spec/field.md), on the consumer's own element:
 * `<div fieldRoot name="email" [validate]="check" validationMode="onBlur">`. The parts and the
 * integrated controls inside it find it by injection (`injectField()`). Inside a `[fieldsetRoot]`
 * a disabled Fieldset disables it; inside a `form[formRoot]` it takes the Form's
 * `validationMode`, shows its server errors and is validated by its submission.
 */
@Directive({
    selector: "[fieldRoot]",
    exportAs: "fieldRoot",
    host: {
        "data-primitives-part": "field-root",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class FieldRoot {
    /** The control's form name; it wins over the control's own, and keys the Form's errors. */
    readonly name = input<string | undefined>(undefined);
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Forces the invalid state (an error the app found). */
    readonly invalid = input(false, { transform: booleanAttribute });
    readonly validate = input<FieldValidate | undefined>(undefined);
    /** Default: the enclosing Form's, else `"onSubmit"`. */
    readonly validationMode = input<FieldValidationMode | undefined>(undefined);

    private readonly fieldset = inject(FIELDSET_CONTEXT, { optional: true });
    private readonly form = inject(FORM_CONTEXT, { optional: true });
    private readonly touched = signal(false);
    private readonly focused = signal(false);
    private readonly dirty = signal(false);
    private readonly filled = signal(false);
    /** What the field shows: its validity and messages. */
    readonly shown = signal<FieldValidation>(UNVALIDATED);
    /** The label's id, for the control's `aria-labelledby`. */
    readonly labelId = signal<string | undefined>(undefined);
    /**
     * The control's id, whether `<label for>` can point at it, and whether a press on the label
     * only focuses it (a picker's Trigger, which a click would open).
     */
    readonly control = signal<{
        id: string;
        labelable: boolean;
        focusOnLabel: boolean;
    } | null>(null);
    private readonly messages = signal<readonly HTMLElement[]>([]);
    /** The description's and the shown errors' ids, in document order. */
    readonly describedBy = computed(() => fieldDescribedBy(this.messages()));
    /** Its own `disabled`, or a disabled Fieldset's around it. */
    readonly isDisabled = computed(
        () => this.disabled() || (this.fieldset?.disabled() ?? false),
    );
    /** The mode it validates in: its own, the Form's, else `"onSubmit"`. */
    readonly mode = computed<FieldValidationMode>(
        () =>
            this.validationMode() ?? this.form?.validationMode() ?? "onSubmit",
    );
    /** The enclosing Form's errors for the field (its `name`). */
    readonly formErrors = computed(() =>
        formErrorsFor(this.form?.errors(), this.name()),
    );
    private readonly valid = computed(() =>
        this.isDisabled()
            ? null
            : this.invalid() || this.formErrors().length > 0
              ? false
              : this.shown().validity.valid,
    );
    /** `aria-invalid`: the field shows an error and is not disabled. */
    readonly showsInvalid = computed(() => this.valid() === false);
    readonly state = computed<FieldState>(() => ({
        valid: this.valid(),
        dirty: this.dirty(),
        touched: this.touched(),
        filled: this.filled(),
        focused: this.focused(),
        disabled: this.isDisabled(),
    }));
    /** The field's state attributes, which every part and the control's main element carry. */
    readonly data = computed(() =>
        dataValues(fieldStateAttributes(this.state())),
    );
    /** Inside a `form[formRoot]`: its submission validates the field (not the native attempt). */
    readonly inForm = this.form !== null;

    // whether the value changed once, or a submission was attempted (the required rule)
    private changed = false;
    private submitted = false;
    private readonly validator = createFieldValidator();
    private entry: FieldControlEntry | null = null;

    constructor() {
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(() => this.validator.cancel());
        if (this.form !== null) {
            destroyRef.onDestroy(
                this.form.register({
                    name: () => untracked(this.name),
                    submitAttempt: () => this.attemptSubmit(),
                    focusTarget: () => this.entry?.focusTarget() ?? null,
                }),
            );
        }
    }

    /**
     * Validates: the result now, or `null` while an async `validate` is pending, `settle` then
     * receiving it (latest wins).
     */
    private run(
        element: HTMLInputElement | null,
        value: unknown,
        always: boolean,
        settle: (validation: FieldValidation) => void,
    ): FieldValidation | null {
        return this.validator.run(
            element,
            {
                value,
                validate: untracked(this.validate),
                valueChanged: this.changed,
                always,
            },
            settle,
        );
    }

    /** A submission attempt; whether the field is invalid now. */
    private submit(element: HTMLInputElement | null, value: unknown): boolean {
        this.submitted = true;
        this.changed = true;
        const result = this.run(
            element,
            value,
            validatesOnChange(untracked(this.mode), true),
            (settled) => this.shown.set(settled),
        );
        if (result !== null) {
            this.shown.set(result);
        }
        if (untracked(this.isDisabled)) {
            return false;
        }
        return (
            untracked(this.invalid) ||
            untracked(this.formErrors).length > 0 ||
            result?.validity.valid === false
        );
    }

    /** The Form's submission: the control's element and value, as the native attempt gives them. */
    private attemptSubmit(): boolean {
        const entry = this.entry;
        return entry === null
            ? this.submit(null, undefined)
            : this.submit(entry.input(), untracked(entry.value));
    }

    readonly events: FieldControlEvents = {
        mounted: (element, value, filled) => {
            this.filled.set(filled);
            this.run(element, value, false, () => {});
        },
        changed: (element, value, dirty, filled) => {
            this.changed = true;
            this.dirty.set(dirty);
            this.filled.set(filled);
            // the first change clears the Form's errors for the field
            const name = untracked(this.name);
            if (
                this.form !== null &&
                name !== undefined &&
                untracked(this.formErrors).length > 0
            ) {
                this.form.clearErrors(name);
            }
            const onChange = validatesOnChange(
                untracked(this.mode),
                this.submitted,
            );
            const apply = (next: FieldValidation | null) =>
                this.shown.update((before) =>
                    shownAfterChange(before, next, onChange),
                );
            // a pending run (`null`) still hides a shown error at once when the field does not
            // validate on change (spec/field.md, "Async validation")
            apply(this.run(element, value, onChange, apply));
        },
        focused: () => this.focused.set(true),
        blurred: (element, value) => {
            this.focused.set(false);
            this.touched.set(true);
            if (untracked(this.mode) === "onBlur") {
                const next = this.run(element, value, false, (settled) =>
                    this.shown.set(settled),
                );
                if (next !== null) {
                    this.shown.set(next);
                }
            }
        },
        submitAttempt: (element, value) => this.submit(element, value),
    };

    /** The control registers its id; returns the cleanup. */
    registerControl(
        id: string,
        labelable: boolean,
        focusOnLabel = false,
    ): () => void {
        const entry = { id, labelable, focusOnLabel };
        this.control.set(entry);
        return () => {
            if (untracked(this.control) === entry) {
                this.control.set(null);
            }
        };
    }

    /**
     * The control registers its validated element, value and focus target (the Form's submission
     * and focus read them); returns the cleanup.
     */
    registerEntry(entry: FieldControlEntry): () => void {
        this.entry = entry;
        return () => {
            if (this.entry === entry) {
                this.entry = null;
            }
        };
    }

    /** A description, or a shown error, listed in the control's `aria-describedby`. */
    registerMessage(element: HTMLElement): () => void {
        this.messages.update((list) => [
            ...list.filter((entry) => entry !== element),
            element,
        ]);
        return () =>
            this.messages.update((list) =>
                list.filter((entry) => entry !== element),
            );
    }
}
