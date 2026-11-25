import { Component, signal, ViewEncapsulation } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/number-field";
import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";
import { Output } from "../../kit/output.ts";
import { NUMBER_FIELD_PARTS } from "./number-field-parts.ts";
import { NumberOutput } from "./number-output.ts";

/** spec/number-field.md, `/number-field/commit`: the committed value next to the changes. */
@Component({
    selector: "[scenario-number-field-commit]",
    encapsulation: ViewEncapsulation.None,
    imports: [Label, NUMBER_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2">
            <label label for="amount" [class]="labelStyles.root">Amount</label>
            <div numberFieldRoot [id]="'amount'" [name]="'amount'" [defaultValue]="50" [min]="0" [max]="100" [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" (valueCommitted)="committed($event)" [class]="styles.root">
                <div numberFieldGroup [class]="styles.group"><button numberFieldDecrement aria-label="Decrease" [class]="styles.decrement">−</button><input numberFieldInput [class]="styles.input" /><button numberFieldIncrement aria-label="Increase" [class]="styles.increment">+</button></div>
            </div>
            <button type="reset">Reset</button>
        </form>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason(), committed: commit()?.value, commitReason: commit()?.reason, commits: commit()?.count ?? 0 }"></pre>
    `,
})
export class NumberFieldCommit {
    protected readonly styles = numberField;
    protected readonly labelStyles = label;
    protected readonly output = new NumberOutput();
    protected readonly commit = signal<
        { value: string; reason: string; count: number } | undefined
    >(undefined);

    protected committed({
        value,
        details,
    }: ValueChangeEvent<number | null>): void {
        this.commit.update((last) => ({
            value: value === null ? "null" : String(value),
            reason: details.reason,
            count: (last?.count ?? 0) + 1,
        }));
    }
}
