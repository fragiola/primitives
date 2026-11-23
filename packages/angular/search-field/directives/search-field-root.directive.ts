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

/** The state every part renders with (spec/search-field.md, "API"). */
export interface SearchFieldState {
    value: string;
    empty: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/**
 * Holds a SearchField's query (spec/search-field.md, React Aria's search field): `<div
 * searchFieldRoot [(value)]="query" name="q" (valueSubmit)="search($event)">` around its Input and
 * its ClearButton. Escape and the ClearButton empty it, Enter submits it (`(valueSubmit)`: an
 * output named `submit` would also listen to the native `submit` event on the Root's element).
 * Every part carries its state (`data-empty`, `data-disabled`, `data-readonly`, `data-required`);
 * the Root also the Field's.
 */
@Directive({
    selector: "[searchFieldRoot]",
    exportAs: "searchFieldRoot",
    host: {
        "data-primitives-part": "search-field-root",
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
    },
})
export class SearchFieldRoot {
    /** The bound query (`[(value)]`); `value()` is the current one. */
    readonly boundValue = input<string | undefined>(undefined, {
        alias: "value",
    });
    readonly valueChange = output<string>();
    readonly defaultValue = input("");
    readonly valueChangeDetails = output<ValueChangeEvent<string>>();
    /** Enter in the Input, with the current query (React's `onSubmit`). */
    readonly valueSubmit = output<string>();
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly required = input(false, { transform: booleanAttribute });
    readonly name = input<string | undefined>(undefined);
    /** The Input's `id` (bind it, `[id]="'search'"`: a static one also lands on the Root). */
    readonly id = input<string | undefined>(undefined);

    private readonly flush = injectFlush();
    private readonly generatedId = injectId("primitives-search-field");
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
    /** The query. */
    readonly value = this.text.value;
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
    readonly state = computed<SearchFieldState>(() => ({
        value: this.value(),
        empty: this.value() === "",
        disabled: this.isDisabled(),
        readOnly: this.readOnly(),
        required: this.required(),
    }));
    /** The state attributes, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            empty: state.empty,
            disabled: state.disabled,
            readonly: state.readOnly,
            required: state.required,
        });
    });

    /** Sets the query and renders it; a bound value the consumer kept is put back. */
    private write(text: string, details: ChangeDetails): void {
        this.text.set(text, details);
        this.flush();
        const element = untracked(this.inputElement);
        const kept = untracked(this.value);
        if (element !== null && element.value !== kept) {
            element.value = kept;
        }
    }

    /** The Input's text changed. */
    type(text: string, event: Event): void {
        this.write(text, { reason: "input-change", event });
    }

    /** Escape in the Input: whether it cleared the field (spec/search-field.md, "Keyboard"). */
    escape(event: Event): boolean {
        if (
            untracked(this.value) === "" ||
            untracked(this.isDisabled) ||
            this.readOnly()
        ) {
            // left to the page
            return false;
        }
        this.write("", { reason: "escape-key", event });
        return true;
    }

    /** Enter in the Input. */
    submit(): void {
        if (!untracked(this.isDisabled) && !this.readOnly()) {
            this.valueSubmit.emit(untracked(this.value));
        }
    }

    /** The ClearButton's press: empties the field and focuses the Input. */
    clear(event: Event): void {
        if (untracked(this.isDisabled) || this.readOnly()) {
            return;
        }
        if (untracked(this.value) !== "") {
            this.write("", { reason: "clear-press", event });
        }
        untracked(this.inputElement)?.focus();
    }

    /** A form reset: the default query. */
    reset(): void {
        this.field.reset();
        this.text.set(this.defaultValue(), { reason: "none" });
        this.flush();
        const element = untracked(this.inputElement);
        if (element !== null) {
            element.value = untracked(this.value);
        }
    }
}
