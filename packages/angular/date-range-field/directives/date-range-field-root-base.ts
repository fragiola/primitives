import { booleanAttribute, Directive, input, type Signal } from "@angular/core";
import type {
    DateFieldState,
    DateFieldSystemInputs,
} from "@fragiola/primitives-angular/date-field";
import { injectHost } from "@fragiola/primitives-angular/internal";
import type {
    DateRangeFieldInputs,
    DateRangeFieldRootState,
} from "../utils/date-range-field-state.ts";

/** `hourCycle="24"` and `[hourCycle]="24"` give `24`; nothing gives `undefined`. */
function hourCycleAttribute(value: unknown): 12 | 24 | undefined {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }
    return Number(value) === 12 ? 12 : 24;
}

/**
 * The inputs and the root element both range field roots share (spec/date-range-field.md,
 * "API"). Each root declares its own typed `value`, `granularity`, `placeholderValue` and bounds,
 * and creates the state after them. Every part carries its state.
 */
@Directive({
    host: {
        "[attr.data-primitives-part]": "rangeField.part('root')",
        "[attr.data-disabled]": "rangeField.data().disabled",
        "[attr.data-readonly]": "rangeField.data().readonly",
        "[attr.data-required]": "rangeField.data().required",
        "[attr.data-invalid]": "rangeField.data().invalid",
        "[attr.data-valid]": "rangeField.data().valid",
        "[attr.data-dirty]": "rangeField.data().dirty",
        "[attr.data-touched]": "rangeField.data().touched",
        "[attr.data-filled]": "rangeField.data().filled",
        "[attr.data-focused]": "rangeField.data().focused",
    },
})
export abstract class DateRangeFieldRootBase {
    /** `12` or `24`; default: the locale's. */
    readonly hourCycle = input<12 | 24 | undefined, unknown>(undefined, {
        transform: hourCycleAttribute,
    });
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    readonly locale = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly readOnly = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The start's hidden input name. */
    readonly startName = input<string | undefined>(undefined);
    /** The end's hidden input name. */
    readonly endName = input<string | undefined>(undefined);
    protected readonly host = injectHost();
    /** The root's state, for its parts. */
    abstract readonly rangeField: DateRangeFieldRootState;
    /** The state every part renders with, for `exportAs`. */
    get state(): Signal<DateFieldState> {
        return this.rangeField.state;
    }

    /** The inputs the state reads, with the root's own typed ones. */
    protected stateInputs(
        own: Pick<
            DateRangeFieldInputs,
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
    ): DateRangeFieldInputs {
        return {
            ...own,
            system,
            hourCycle: this.hourCycle,
            locale: this.locale,
            required: this.required,
            readOnly: this.readOnly,
            disabled: this.disabled,
            startName: this.startName,
            endName: this.endName,
        };
    }
}
