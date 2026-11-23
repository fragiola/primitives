import { Component, signal, ViewEncapsulation } from "@angular/core";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import { Output } from "../../kit/output.ts";
import { SEGMENTED_CONTROL_PARTS, segments } from "./segments.ts";
import { VIEWS } from "./views.ts";

const ENABLED = VIEWS.filter((view) => view.value !== "board").map(
    ({ value, label }) => ({ value, label }),
);

/** A disabled control (spec/segmented-control.md, `/segmented-control/disabled`). */
@Component({
    selector: "[scenario-segmented-control-disabled]",
    encapsulation: ViewEncapsulation.None,
    imports: [SEGMENTED_CONTROL_PARTS, Output],
    template: `
        <h2 id="view" class="text-sm font-semibold">View</h2>
        <div segmentedControlRoot aria-labelledby="view" [disabled]="true" [defaultValue]="'grid'" (valueChange)="value.set($event)" [class]="styles.root">${segments("segments")}</div>
        <button type="button" class="mt-2">After</button>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class SegmentedControlDisabled {
    protected readonly styles = segmentedControl;
    protected readonly segments: readonly {
        value: string;
        label: string;
        disabled?: boolean;
    }[] = ENABLED;
    protected readonly value = signal<string | null | undefined>(undefined);
}
