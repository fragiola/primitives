import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    createHoverCardHandle,
    type OpenChangeEvent,
} from "@fragiola/primitives-angular/hover-card";
import { hoverCard } from "examples-shared/recipes/hover-card";
import { Output } from "../../kit/output.ts";
import { HOVER_CARD_PARTS } from "./hover-card-parts.ts";

/** One HoverCard previewing two triggers, each with a name as its payload. */
@Component({
    selector: "[scenario-hover-card-detached]",
    encapsulation: ViewEncapsulation.None,
    imports: [HOVER_CARD_PARTS, Output],
    template: `
        <div class="flex gap-8">
            @for (name of people; track name) {
                <a hoverCardTrigger [handle]="handle" [payload]="name" [id]="name.toLowerCase()" [href]="'#' + name.toLowerCase()" [class]="styles.trigger">{{ "@" + name.toLowerCase() }}</a>
            }
        </div>
        <ng-container hoverCardRoot #root="hoverCardRoot" [handle]="handle" [delay]="300" (openChangeDetails)="onOpenChange($event)">
            <ng-container *hoverCardPortal>
                <div hoverCardBackdrop [class]="styles.backdrop"></div>
                <div hoverCardPositioner [sideOffset]="8" [class]="styles.positioner">
                    <div hoverCardPopup [class]="styles.popup">{{ "Profile of " + root.payload() }}</div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ open: open(), reason: reason(), trigger: trigger() }"></pre>
    `,
})
export class HoverCardDetached {
    protected readonly styles = hoverCard;
    protected readonly people = ["Ada", "Grace"];
    protected readonly handle = createHoverCardHandle<string>();
    protected readonly open = signal(false);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly trigger = signal<string | undefined>(undefined);

    protected onOpenChange(event: OpenChangeEvent): void {
        this.open.set(event.open);
        this.reason.set(event.details.reason);
        this.trigger.set(event.details.trigger?.id);
    }
}
