import {
    computed,
    Directive,
    input,
    numberAttribute,
    signal,
} from "@angular/core";
import { progressValue } from "@fragiola/primitives/range";
import { ownAttribute } from "@fragiola/primitives-angular/internal";

export interface MeterState {
    /** The value, clamped to `[min, max]`. */
    value: number;
    min: number;
    max: number;
}

/**
 * The `meter`: holds the value and its formatted text (spec/meter.md, the APG meter):
 * `<div meterRoot [value]="charge">` around its Label, Value and Track. No state attribute: a
 * meter has a value and nothing else.
 */
@Directive({
    selector: "[meterRoot]",
    exportAs: "meterRoot",
    host: {
        role: "meter",
        "data-primitives-part": "meter-root",
        "[attr.aria-valuemin]": "state().min",
        "[attr.aria-valuemax]": "state().max",
        "[attr.aria-valuenow]": "state().value",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-labelledby]": "labelledBy()",
    },
})
export class MeterRoot {
    /** The measurement; clamped to `[min, max]`. */
    readonly value = input.required({ transform: numberAttribute });
    readonly min = input(0, { transform: numberAttribute });
    readonly max = input(100, { transform: numberAttribute });
    /** How the value is written; default: a percentage of the range. */
    readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
    /** The locale of `format` (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);
    /** The Root's `aria-valuetext` instead of the formatted value. */
    readonly getAriaValueText = input<
        ((formattedValue: string, value: number) => string) | undefined
    >(undefined);

    /** The Label's id, while a Label is rendered. */
    readonly labelId = signal<string | undefined>(undefined);
    private readonly ownLabelledBy = ownAttribute("aria-labelledby");
    // a meter's value is never indeterminate: the progress math with a number always
    private readonly computed = computed(() =>
        progressValue(this.value(), {
            min: this.min(),
            max: this.max(),
            format: this.format(),
            locale: this.locale(),
        }),
    );
    /** From 0 to 100. */
    readonly percent = computed(() => this.computed().percent ?? 0);
    /** The value as `format` writes it. */
    readonly formattedValue = computed(() => this.computed().formattedValue);
    readonly state = computed<MeterState>(() => ({
        value: this.computed().value ?? this.min(),
        min: this.min(),
        max: this.max(),
    }));
    protected readonly valueText = computed(() => {
        const custom = this.getAriaValueText();
        const formatted = this.formattedValue();
        return custom === undefined
            ? formatted
            : custom(formatted, this.state().value);
    });
    protected readonly labelledBy = computed(
        () => this.ownLabelledBy ?? this.labelId() ?? null,
    );
}
