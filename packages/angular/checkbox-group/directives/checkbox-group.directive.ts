import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    signal,
} from "@angular/core";
import {
    fieldControl,
    writeFieldAria,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    dataValues,
    injectHost,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

export interface CheckboxGroupState {
    disabled: boolean;
}

const NONE: readonly string[] = [];

/**
 * Checkboxes sharing one array value, with an optional parent (spec/checkbox.md):
 * `<div checkboxGroup [(value)]="toppings" [allValues]="all">`. Inside a `[fieldRoot]`, the group
 * is the field's control (spec/field.md, "Integration contract"): the field's label names it, its
 * description and errors describe it, `validate` gets its array, and its checkboxes take the
 * field's `name` and `disabled`.
 */
@Directive({
    selector: "[checkboxGroup]",
    exportAs: "checkboxGroup",
    host: {
        role: "group",
        "data-primitives-part": "checkbox-group-root",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "data().disabled",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class CheckboxGroup {
    readonly value = input<readonly string[] | undefined>(undefined);
    readonly valueChange = output<string[]>();
    readonly defaultValue = input<readonly string[]>(NONE);
    readonly valueChangeDetails = output<ValueChangeEvent<string[]>>();
    /** Every child value: what the parent checkbox checks. */
    readonly allValues = input<readonly string[]>(NONE);
    readonly disabled = input(false, { transform: booleanAttribute });

    private readonly host = injectHost();
    private readonly selection = controllable<readonly string[], ChangeDetails>(
        this.value,
        { emit: (next) => this.valueChange.emit([...next]) },
        () => this.defaultValue(),
        (value, details) =>
            this.valueChangeDetails.emit({ value: [...value], details }),
    );
    readonly checked = this.selection.value;
    /**
     * The enclosing field's binding (spec/field.md): the group is the field's control, with no
     * labelable element and no validated element (`validate` decides); a Form focuses its first
     * enabled checkbox.
     */
    readonly field = fieldControl({
        id: signal(undefined),
        labelable: false,
        value: computed(() => [...this.checked()]),
        filled: computed(() => this.checked().length > 0),
        input: () => null,
        focusTarget: () =>
            this.host.querySelector<HTMLElement>(
                '[data-primitives-part="checkbox-root"]:not([disabled])',
            ),
    });
    /** Its own `disabled`, or the field's: every checkbox inside is disabled. */
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The children's element ids, for the parent's `aria-controls`. */
    readonly ids = signal<Readonly<Record<string, string>>>({});
    readonly state = computed<CheckboxGroupState>(() => ({
        disabled: this.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        writeFieldAria(this.field, this.host, {
            "aria-labelledby": this.field.labelledBy,
            "aria-describedby": this.field.describedBy,
            "aria-invalid": this.field.ariaInvalid,
        });
    }

    /** Focus left the group (not to one of its checkboxes): the field is touched. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.contains(next)) {
            return;
        }
        this.field.blurred();
    }

    private order(values: readonly string[]): string[] {
        const all = this.allValues();
        return all.length === 0
            ? [...values]
            : [
                  ...all.filter((entry) => values.includes(entry)),
                  ...values.filter((entry) => !all.includes(entry)),
              ];
    }

    /** Checks or clears one child's value. */
    toggle(entry: string, checked: boolean): void {
        const value = this.checked();
        const next = checked
            ? this.order([...value.filter((item) => item !== entry), entry])
            : value.filter((item) => item !== entry);
        this.selection.set(next, { reason: "none" });
    }

    /** The parent checkbox: checks every value of `allValues`, or none. */
    setAll(checked: boolean): void {
        this.selection.set(checked ? [...this.allValues()] : [], {
            reason: "none",
        });
    }

    /** A form reset: back to `defaultValue`. */
    reset(): void {
        this.field.reset();
        this.selection.set(this.defaultValue(), { reason: "none" });
    }

    registerId(entry: string, id: string | null): void {
        this.ids.update((current) => {
            if (id === null) {
                const { [entry]: _, ...rest } = current;
                return rest;
            }
            return current[entry] === id
                ? current
                : { ...current, [entry]: id };
        });
    }
}
