import { Component, ViewEncapsulation } from "@angular/core";
import { Label } from "@fragiola/primitives-angular/label";
import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";
import { Output } from "../../kit/output.ts";
import { NUMBER_FIELD_PARTS } from "./number-field-parts.ts";
import { NumberOutput } from "./number-output.ts";

/** spec/number-field.md, `/number-field/scrub`: a scrub area, its virtual cursor and the wheel. */
@Component({
    selector: "[scenario-number-field-scrub]",
    encapsulation: ViewEncapsulation.None,
    imports: [Label, NUMBER_FIELD_PARTS, Output],
    template: `
        <div numberFieldRoot [id]="'width'" [defaultValue]="100" [allowWheelScrub]="true" [locale]="'en-US'" (valueChangeDetails)="output.changed($event)" [class]="styles.root">
            <span numberFieldScrubArea data-testid="scrub" [class]="styles.scrubArea"><label label for="width" [class]="labelStyles.root">Width</label><span *numberFieldScrubAreaCursor [class]="styles.scrubAreaCursor"></span></span>
            <div numberFieldGroup [class]="styles.group"><input numberFieldInput [class]="styles.input" /></div>
        </div>
        <pre fixtureOutput [values]="{ value: output.value(), reason: output.reason() }"></pre>
    `,
})
export class NumberFieldScrub {
    protected readonly styles = numberField;
    protected readonly labelStyles = label;
    protected readonly output = new NumberOutput();
}
