import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { OpenChangeEvent } from "@fragiola/primitives-angular/hover-card";
import { hoverCard } from "examples-shared/recipes/hover-card";
import { Output } from "../../kit/output.ts";
import { HOVER_CARD_PARTS } from "./hover-card-parts.ts";

@Component({
    selector: "[scenario-hover-card-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [HOVER_CARD_PARTS, Output],
    template: `
        <button type="button">Before</button>
        <p class="mt-4">Written by <ng-container hoverCardRoot [delay]="500" [closeDelay]="200" [open]="open()" (openChangeDetails)="onOpenChange($event)"><a hoverCardTrigger href="#ada" [class]="styles.trigger">@ada</a><ng-container *hoverCardPortal><div hoverCardPositioner [sideOffset]="8" [class]="styles.positioner"><div hoverCardPopup [class]="styles.popup"><div hoverCardArrow [class]="styles.arrow"></div><strong>Ada Lovelace</strong><span>Mathematician and writer</span><a href="#ada-profile">View profile</a></div></div></ng-container></ng-container></p>
        <pre fixtureOutput [values]="{ open: open(), reason: reason() }"></pre>
    `,
})
export class HoverCardBasic {
    protected readonly styles = hoverCard;
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
    }
}
