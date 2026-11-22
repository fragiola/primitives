import {
    computed,
    Directive,
    input,
    numberAttribute,
    signal,
} from "@angular/core";
import { type ProgressStatus, progressValue } from "@fragiola/primitives/range";
import {
    dataValues,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";

export interface ProgressState {
    /** The clamped value, `null` when indeterminate. */
    value: number | null;
    min: number;
    max: number;
    status: ProgressStatus;
}

/** Exactly one of `data-indeterminate`, `data-progressing`, `data-complete` (spec/progress.md). */
export function statusAttributes(status: ProgressStatus) {
    return dataValues({
        indeterminate: status === "indeterminate",
        progressing: status === "progressing",
        complete: status === "complete",
    });
}

/**
 * The `progressbar`: holds the value, its status and its formatted text (spec/progress.md):
 * `<div progressRoot [value]="upload">` around its Label, Value and Track.
 */
@Directive({
    selector: "[progressRoot]",
    exportAs: "progressRoot",
    host: {
        role: "progressbar",
        "data-primitives-part": "progress-root",
        "[attr.aria-valuemin]": "state().min",
        "[attr.aria-valuemax]": "state().max",
        "[attr.aria-valuenow]": "state().value",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-labelledby]": "labelledBy()",
        "[attr.data-indeterminate]": "data().indeterminate",
        "[attr.data-progressing]": "data().progressing",
        "[attr.data-complete]": "data().complete",
    },
})
export class ProgressRoot {
    /** A number, or `null` for an indeterminate progress; clamped to `[min, max]`. */
    readonly value = input.required<number | null>();
    readonly min = input(0, { transform: numberAttribute });
    readonly max = input(100, { transform: numberAttribute });
    /** How the value is written; default: a percentage of the range. */
    readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
    /** The locale of `format` (BCP 47; default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);
    /** The Root's `aria-valuetext` instead of the formatted value. */
    readonly getAriaValueText = input<
        ((formattedValue: string, value: number | null) => string) | undefined
    >(undefined);

    /** The Label's id, while a Label is rendered. */
    readonly labelId = signal<string | undefined>(undefined);
    private readonly ownLabelledBy = ownAttribute("aria-labelledby");
    private readonly progress = computed(() =>
        progressValue(this.value(), {
            min: this.min(),
            max: this.max(),
            format: this.format(),
            locale: this.locale(),
        }),
    );
    /** From 0 to 100; `null` when indeterminate. */
    readonly percent = computed(() => this.progress().percent);
    /** The value as `format` writes it; `""` when indeterminate. */
    readonly formattedValue = computed(() => this.progress().formattedValue);
    readonly state = computed<ProgressState>(() => {
        const { value, status } = this.progress();
        return { value, min: this.min(), max: this.max(), status };
    });
    protected readonly data = computed(() =>
        statusAttributes(this.state().status),
    );
    protected readonly valueText = computed(() => {
        const { formattedValue, value, status } = this.progress();
        const custom = this.getAriaValueText();
        if (custom !== undefined) {
            return custom(formattedValue, value);
        }
        return status === "indeterminate" ? null : formattedValue;
    });
    protected readonly labelledBy = computed(
        () => this.ownLabelledBy ?? this.labelId() ?? null,
    );
}
