import { signal } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/date-field";

/** The last `valueChangeDetails` of a date or time field (spec/date-field.md, "Scenarios"). */
export class FieldOutput<Value> {
    private readonly last = signal<{ value: string; reason: string } | null>(
        null,
    );
    readonly value = () => this.last()?.value;
    readonly reason = () => this.last()?.reason;

    constructor(private readonly print: (value: Value) => string | undefined) {}

    readonly changed = ({ value, details }: ValueChangeEvent<Value | null>) =>
        this.last.set({
            value: value === null ? "none" : (this.print(value) ?? "none"),
            reason: details.reason,
        });
}
