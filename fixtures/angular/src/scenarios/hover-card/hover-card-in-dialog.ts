import { Component, ViewEncapsulation } from "@angular/core";
import {
    DialogBackdrop,
    DialogClose,
    DialogPopup,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "@fragiola/primitives-angular/dialog";
import { dialog } from "examples-shared/recipes/dialog";
import { hoverCard } from "examples-shared/recipes/hover-card";
import { HOVER_CARD_PARTS } from "./hover-card-parts.ts";

@Component({
    selector: "[scenario-hover-card-in-dialog]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        DialogTitle,
        DialogClose,
        HOVER_CARD_PARTS,
    ],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger [class]="styles.trigger">Open dialog</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">Credits</h2>
                    <ng-container hoverCardRoot [delay]="0">
                        <a hoverCardTrigger href="#ada" [class]="cardStyles.trigger">@ada</a>
                        <ng-container *hoverCardPortal>
                            <div hoverCardPositioner [sideOffset]="8" [class]="cardStyles.positioner">
                                <div hoverCardPopup [class]="cardStyles.popup">Ada Lovelace</div>
                            </div>
                        </ng-container>
                    </ng-container>
                    <button dialogClose [class]="styles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export class HoverCardInDialog {
    protected readonly styles = dialog;
    protected readonly cardStyles = hoverCard;
}
