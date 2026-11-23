import { Component, signal, ViewEncapsulation } from "@angular/core";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { SEGMENTED_CONTROL_PARTS, segments } from "./segments.ts";
import { VIEWS } from "./views.ts";

/** A view switcher in a form (spec/segmented-control.md, `/segmented-control/basic`). */
@Component({
    selector: "[scenario-segmented-control-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [SEGMENTED_CONTROL_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <h2 id="view" class="text-sm font-semibold">View</h2>
            <div segmentedControlRoot aria-labelledby="view" [name]="'view'" [defaultValue]="'list'" (valueChangeDetails)="value.set($event.value); reason.set($event.details.reason)" [class]="styles.root">${segments("segments", "true")}</div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), form: form() }"></pre>
    `,
})
export class SegmentedControlBasic {
    protected readonly styles = segmentedControl;
    protected readonly segments = VIEWS;
    protected readonly value = signal<string | null | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
