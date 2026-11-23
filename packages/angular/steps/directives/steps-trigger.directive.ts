import { Directive, inject } from "@angular/core";
import { StepsItem } from "./steps-item.directive.ts";

/**
 * Moves to its Item's step (spec/steps.md): `<button stepsTrigger>` inside an Item; disabled
 * while that step cannot be reached.
 */
@Directive({
    selector: "button[stepsTrigger]",
    exportAs: "stepsTrigger",
    host: {
        type: "button",
        "data-primitives-part": "steps-trigger",
        "[attr.disabled]": "item.state().disabled ? '' : null",
        "[attr.aria-current]": "item.state().current ? 'step' : null",
        "[attr.aria-controls]": "item.root.contentId(item.index())",
        "[attr.data-current]": "item.data().current",
        "[attr.data-completed]": "item.data().completed",
        "[attr.data-incomplete]": "item.data().incomplete",
        "[attr.data-disabled]": "item.data().disabled",
        "[attr.data-orientation]": "item.data().orientation",
        "(click)": "press($event)",
    },
})
export class StepsTrigger {
    protected readonly item = inject(StepsItem);
    readonly state = this.item.state;

    protected press(event: Event): void {
        if (this.item.state().disabled) {
            return;
        }
        this.item.root.setStep(this.item.index(), {
            reason: "trigger-press",
            event,
        });
    }
}
