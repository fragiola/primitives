import { Component } from "@angular/core";
import {
    TooltipArrow,
    TooltipPopup,
    TooltipPortal,
    TooltipPositioner,
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
} from "@fragiola/primitives-angular/tooltip";
import { styles } from "./styles.ts";

const TOOLS = [
    { label: "Bold", hint: "Bold (Ctrl+B)" },
    { label: "Italic", hint: "Italic (Ctrl+I)" },
    { label: "Underline", hint: "Underline (Ctrl+U)" },
];

// A row of toolbar buttons described by tooltips: the first one waits for the delay, moving to
// the next opens it at once, keyboard focus opens it with no delay and Escape closes it.
@Component({
    selector: "example-toolbar-hints",
    imports: [
        TooltipProvider,
        TooltipRoot,
        TooltipTrigger,
        TooltipPortal,
        TooltipPositioner,
        TooltipPopup,
        TooltipArrow,
    ],
    template: `
        <ng-container tooltipProvider [delay]="500">
            <div [class]="styles.toolbar">
                @for (tool of tools; track tool.label) {
                    <ng-container tooltipRoot>
                        <button tooltipTrigger [class]="styles.trigger">{{ tool.label }}</button>
                        <ng-container *tooltipPortal>
                            <div tooltipPositioner [sideOffset]="8" [class]="styles.positioner">
                                <div tooltipPopup [class]="styles.popup">
                                    <div tooltipArrow [class]="styles.arrow"></div>
                                    {{ tool.hint }}
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                }
            </div>
        </ng-container>
    `,
})
export default class ToolbarHints {
    protected readonly styles = styles;
    protected readonly tools = TOOLS;
}
