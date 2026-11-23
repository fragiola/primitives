import { signal } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/number-field";

/** The last `valueChangeDetails` (spec/number-field.md, "Scenarios"): its value and its reason. */
export class NumberOutput {
    private readonly last = signal<{ value: string; reason: string } | null>(
        null,
    );
    readonly value = () => this.last()?.value;
    readonly reason = () => this.last()?.reason;

    readonly changed = ({ value, details }: ValueChangeEvent<number | null>) =>
        this.last.set({
            value: value === null ? "null" : String(value),
            reason: details.reason,
        });
}
