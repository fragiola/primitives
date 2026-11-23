import { Component, input, ViewEncapsulation } from "@angular/core";
import { hoverCard } from "examples-shared/recipes/hover-card";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { Output } from "../../kit/output.ts";
import { HOVER_CARD_PARTS } from "./hover-card-parts.ts";

/** spec/README.md, "The lifecycle scenarios". */
@Component({
    selector: "[scenario-hover-card-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [HOVER_CARD_PARTS, Output],
    template: `
        <p>
            <ng-container hoverCardRoot [delay]="0" [closeDelay]="0" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)">
                <a hoverCardTrigger href="#ada" [class]="styles.trigger">@ada</a>
                <ng-container *hoverCardPortal="{ keepMounted: true }">
                    <div hoverCardPositioner [sideOffset]="8" [class]="styles.positioner">
                        <div hoverCardPopup [class]="styles.popup">Ada Lovelace</div>
                    </div>
                </ng-container>
            </ng-container>
        </p>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class HoverCardLifecycle {
    protected readonly styles = hoverCard;
    readonly cancel = input(false);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
