import {
    afterNextRender,
    DestroyRef,
    Directive,
    effect,
    forwardRef,
    Injector,
    inject,
    input,
    linkedSignal,
    output,
    untracked,
} from "@angular/core";
import {
    type FieldValidationMode,
    type FormErrors,
    firstInDocumentOrder,
    focusFieldControl,
    formErrorsFor,
    guardFormSubmit,
    withoutFormErrors,
} from "@fragiola/primitives/form";
import {
    FORM_CONTEXT,
    type FormContext,
    type FormField,
} from "@fragiola/primitives-angular/field";
import { injectHost } from "@fragiola/primitives-angular/internal";

const NO_ERRORS: FormErrors = {};

/** Focuses the first of these fields in document order, if any; whether one was focused. */
function focusFirst(fields: readonly FormField[]): boolean {
    const target = firstInDocumentOrder(
        fields.map((field) => field.focusTarget()),
    );
    if (target === null) {
        return false;
    }
    focusFieldControl(target);
    return true;
}

/**
 * A native form that validates its Fields itself (spec/form.md), on the consumer's own `<form>`:
 * `<form formRoot [errors]="errors" (clearErrors)="errors = $event" (submit)="send($event)">`. Its
 * submission validates every Field inside it, shows their errors and focuses the first invalid
 * one; while one is invalid, the submission is blocked in its capture phase, so the consumer's
 * `(submit)` listener runs only for a submission that goes on. `errors` are server errors keyed by
 * the Fields' `name`; `validationMode` is its Fields' default.
 */
@Directive({
    selector: "form[formRoot]",
    exportAs: "formRoot",
    providers: [
        {
            provide: FORM_CONTEXT,
            useFactory: () => inject(forwardRef(() => Form)).context,
        },
    ],
    host: {
        novalidate: "",
        "data-primitives-part": "form-root",
    },
})
export class Form {
    /** Server errors, `{ [fieldName]: message | messages }`; a new object replaces the Form's copy. */
    readonly errors = input<FormErrors>(NO_ERRORS);
    /** The default `validationMode` of every Field inside it. */
    readonly validationMode = input<FieldValidationMode>("onSubmit");
    /** A field's value changed while the Form had errors for it: the errors left. */
    readonly clearErrors = output<FormErrors>();

    /** The Form's own copy of `errors`. */
    private readonly current = linkedSignal(() => this.errors());
    private readonly fields = new Set<FormField>();
    // a submission went on: the next `errors` (the server's answer) focuses the first field it names
    private submitted = false;

    /** What the Fields inside read (spec/form.md). */
    readonly context: FormContext = {
        validationMode: this.validationMode,
        errors: this.current,
        clearErrors: (name) => {
            const before = untracked(this.current);
            const next = withoutFormErrors(before, name);
            if (next !== before) {
                this.current.set(next);
                this.clearErrors.emit(next);
            }
        },
        register: (field) => {
            this.fields.add(field);
            return () => this.fields.delete(field);
        },
    };

    constructor() {
        const host = injectHost<HTMLFormElement>();
        const destroyRef = inject(DestroyRef);
        const injector = inject(Injector);
        afterNextRender(() => {
            destroyRef.onDestroy(guardFormSubmit(host, () => this.attempt()));
        });
        let first = true;
        effect(() => {
            this.errors();
            untracked(() => {
                if (first) {
                    first = false;
                    return;
                }
                if (!this.submitted) {
                    return;
                }
                this.submitted = false;
                // once the fields rendered the server's answer: the first field it names
                afterNextRender(
                    () => {
                        const errors = untracked(this.current);
                        focusFirst(
                            [...this.fields].filter(
                                (field) =>
                                    formErrorsFor(errors, field.name()).length >
                                    0,
                            ),
                        );
                    },
                    { injector },
                );
            });
        });
    }

    /** A submission: validates every field; whether it goes on. */
    private attempt(): boolean {
        // every field validates, not only up to the first invalid one
        const invalid = [...this.fields].filter((field) =>
            field.submitAttempt(),
        );
        if (invalid.length > 0) {
            focusFirst(invalid);
            return false;
        }
        this.submitted = true;
        return true;
    }
}
