import { Component, signal, ViewEncapsulation } from "@angular/core";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import { Output } from "../../kit/output.ts";
import { SEGMENTED_CONTROL_PARTS, segments } from "./segments.ts";
import { PERIODS } from "./views.ts";

/** A vertical control that stops at its ends (spec/segmented-control.md, `/segmented-control/vertical`). */
@Component({
    selector: "[scenario-segmented-control-vertical]",
    encapsulation: ViewEncapsulation.None,
    imports: [SEGMENTED_CONTROL_PARTS, Output],
    template: `
        <h2 id="period" class="text-sm font-semibold">Period</h2>
        <div segmentedControlRoot aria-labelledby="period" [orientation]="'vertical'" [loopFocus]="false" [defaultValue]="'day'" (valueChange)="value.set($event)" [class]="styles.root">${segments("segments")}</div>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class SegmentedControlVertical {
    protected readonly styles = segmentedControl;
    protected readonly segments = PERIODS;
    protected readonly value = signal<string | null | undefined>(undefined);
}
