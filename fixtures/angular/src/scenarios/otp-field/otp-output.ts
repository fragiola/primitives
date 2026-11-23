import { signal } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/otp-field";

/**
 * The last `valueChangeDetails`, `valueComplete` and `valueInvalid` (spec/otp-field.md,
 * "Scenarios").
 */
export class OtpOutput {
    private readonly last = signal<{ value: string; reason: string } | null>(
        null,
    );
    readonly complete = signal<string | undefined>(undefined);
    readonly invalid = signal<string | undefined>(undefined);
    readonly value = () => this.last()?.value;
    readonly reason = () => this.last()?.reason;

    readonly changed = ({ value, details }: ValueChangeEvent<string>) =>
        this.last.set({
            value: value === "" ? "empty" : value,
            reason: details.reason,
        });
    readonly completed = ({ value }: ValueChangeEvent<string>) =>
        this.complete.set(value);
    readonly refused = ({ value }: ValueChangeEvent<string>) =>
        this.invalid.set(value);
}
