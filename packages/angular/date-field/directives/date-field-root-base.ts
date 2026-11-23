import { booleanAttribute, Directive, input, type Signal } from "@angular/core";
import { injectHost } from "@fragiola/primitives-angular/internal";
import type {
    DateFieldInputs,
    DateFieldRootState,
    DateFieldState,
    DateFieldSystemInputs,
} from "../utils/date-field-state.ts";

/** `hourCycle="24"` and `[hourCycle]="24"` give `24`; nothing gives `undefined`. */
function hourCycleAttribute(value: unknown): 12 | 24 | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    return Number(value) === 12 ? 12 : 24;
}

/**
 * The inputs and the root element both field roots share (spec/date-field.md, "API"). Each root
 * declares its own typed `value`, `granularity`, `placeholderValue` and bounds, and creates the
 * state after them. Every part carries its state (`data-disabled`, `data-readonly`,
 * `data-required`, `data-invalid`, and the Field's).
 */
@Directive({
    host: {
        "[attr.data-primitives-part]": "dateField.part('root')",
        "[attr.data-disabled]": "dateField.data().disabled",
        "[attr.data-readonly]": "dateField.data().readonly",
        "[attr.data-required]": "dateField.data().required",
        "[attr.data-invalid]": "dateField.data().invalid",
        "[attr.data-valid]": "dateField.data().valid",
        "[attr.data-dirty]": "dateField.data().dirty",
        "[attr.data-touched]": "dateField.data().touched",
        "[attr.data-filled]": "dateField.data().filled",
        "[attr.data-focused]": "dateField.data().focused",
    },
})
export abstract class DateFieldRootBase {
    /** `12` or `24`; default: the locale's. */
    readonly hourCycle = input<12 | 24 | undefined, unknown>(undefined, {
        transform: hourCycleAttribute,
    });
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    readonly locale = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The hidden input's name (inside a Field, the Field's `name` wins). */
    readonly name = input<string | undefined>(undefined);
    protected readonly host = injectHost();
    /** The root's state, for its parts. */
    abstract readonly dateField: DateFieldRootState;
    /** The state every part renders with, for `exportAs`. */
    get state(): Signal<DateFieldState> {
        return this.dateField.state;
    }

    /** The inputs the state reads, with the root's own typed ones. */
    protected stateInputs(
        own: Pick<
            DateFieldInputs,
            | "value"
            | "valueChange"
            | "defaultValue"
            | "granularity"
            | "placeholderValue"
            | "min"
            | "max"
            | "isDateUnavailable"
        >,
        system?: DateFieldSystemInputs,
    ): DateFieldInputs {
        return {
            ...own,
            system,
            hourCycle: this.hourCycle,
            locale: this.locale,
            required: this.required,
            readOnly: this.readOnly,
            disabled: this.disabled,
            name: this.name,
        };
    }
}
