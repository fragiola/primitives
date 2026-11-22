import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    type ChangeDetails,
    CollapsiblePanel,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "@fragiola/primitives-angular/collapsible";
import { collapsible } from "examples-shared/recipes/collapsible";
import { Output } from "../../kit/output.ts";

/** spec/collapsible.md, `/collapsible/basic` */
@Component({
    selector: "[scenario-collapsible-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel, Output],
    template: `
        <div class="flex flex-col gap-4">
            <div collapsibleRoot (openChangeDetails)="changed($event.open, $event.details)" [class]="styles.root">
                <button collapsibleTrigger [class]="styles.trigger">Recovery keys</button>
                <div *collapsiblePanel [class]="styles.panel">
                    <p>alpha-1234</p>
                    <p>beta-5678</p>
                </div>
            </div>
            <div collapsibleRoot [defaultOpen]="true" [disabled]="true" [class]="styles.root">
                <button collapsibleTrigger [class]="styles.trigger">Archived keys</button>
                <div *collapsiblePanel [class]="styles.panel">
                    <p>gamma-9012</p>
                </div>
            </div>
        </div>
        <button type="button" class="mt-2">After collapsible</button>
        <pre fixtureOutput [values]="{ open: open(), reason: reason() }"></pre>
    `,
})
export class CollapsibleBasic {
    protected readonly styles = collapsible;
    protected readonly open = signal<boolean | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected changed(open: boolean, details: ChangeDetails): void {
        this.open.set(open);
        this.reason.set(details.reason);
    }
}
