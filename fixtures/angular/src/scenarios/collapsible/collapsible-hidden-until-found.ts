import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    type ChangeDetails,
    CollapsiblePanel,
    CollapsibleRoot,
    CollapsibleTrigger,
} from "@fragiola/primitives-angular/collapsible";
import { collapsible } from "examples-shared/recipes/collapsible";
import { Output } from "../../kit/output.ts";

/** spec/collapsible.md, `/collapsible/hidden-until-found` */
@Component({
    selector: "[scenario-collapsible-hidden-until-found]",
    encapsulation: ViewEncapsulation.None,
    imports: [CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel, Output],
    template: `
        <div class="flex flex-col gap-4">
            <div collapsibleRoot (openChangeDetails)="changed($event.open, $event.details)" [class]="styles.root">
                <button collapsibleTrigger [class]="styles.trigger">Shipping details</button>
                <div *collapsiblePanel="{ hiddenUntilFound: true }" [class]="styles.panel">
                    <p>Ships within two business days</p>
                </div>
            </div>
            <div collapsibleRoot [class]="styles.root">
                <button collapsibleTrigger [class]="styles.trigger">Return policy</button>
                <div *collapsiblePanel="{ keepMounted: true }" [class]="styles.panel">
                    <p>Returns are free for thirty days</p>
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ open: open(), reason: reason() }"></pre>
    `,
})
export class CollapsibleHiddenUntilFound {
    protected readonly styles = collapsible;
    protected readonly open = signal<boolean | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);

    protected changed(open: boolean, details: ChangeDetails): void {
        this.open.set(open);
        this.reason.set(details.reason);
    }
}
