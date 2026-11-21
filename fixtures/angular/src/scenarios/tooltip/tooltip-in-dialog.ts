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
import {
    TooltipPopup,
    TooltipPortal,
    TooltipPositioner,
    TooltipRoot,
    TooltipTrigger,
} from "@fragiola/primitives-angular/tooltip";
import { dialog } from "examples-shared/recipes/dialog";
import { tooltip } from "examples-shared/recipes/tooltip";

@Component({
    selector: "[scenario-tooltip-in-dialog]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DialogRoot,
        DialogTrigger,
        DialogPortal,
        DialogBackdrop,
        DialogPopup,
        DialogTitle,
        DialogClose,
        TooltipRoot,
        TooltipTrigger,
        TooltipPortal,
        TooltipPositioner,
        TooltipPopup,
    ],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger [class]="styles.trigger">Open dialog</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="styles.backdrop"></div>
                <div dialogPopup [class]="styles.popup">
                    <h2 dialogTitle [class]="styles.title">Formatting</h2>
                    <ng-container tooltipRoot>
                        <button tooltipTrigger [class]="tooltipStyles.trigger">Bold</button>
                        <ng-container *tooltipPortal>
                            <div tooltipPositioner [sideOffset]="6" [class]="tooltipStyles.positioner">
                                <div tooltipPopup [class]="tooltipStyles.popup">Bold (Ctrl+B)</div>
                            </div>
                        </ng-container>
                    </ng-container>
                    <button dialogClose [class]="styles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
    `,
})
export class TooltipInDialog {
    protected readonly styles = dialog;
    protected readonly tooltipStyles = tooltip;
}
