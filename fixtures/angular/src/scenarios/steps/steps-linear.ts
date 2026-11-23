import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/steps";
import { steps } from "examples-shared/recipes/steps";
import { Output } from "../../kit/output.ts";
import { STEPS_PARTS } from "./steps-parts.ts";

const STEPS = ["Account", "Profile", "Done"];

/** spec/steps.md, `/steps/linear` */
@Component({
    selector: "[scenario-steps-linear]",
    encapsulation: ViewEncapsulation.None,
    imports: [STEPS_PARTS, Output],
    template: `
        <div stepsRoot [count]="items.length" linear [isStepValid]="isStepValid" (stepChangeDetails)="report($event)" [class]="styles.root">
            <ol stepsList aria-label="Sign up" [class]="styles.list">
                @for (title of items; track title; let index = $index, last = $last) {
                    <li stepsItem [index]="index" [class]="styles.item"><button stepsTrigger [class]="styles.trigger"><span stepsIndicator [class]="styles.indicator">{{ index + 1 }}</span>{{ title }}</button>@if (!last) {<div stepsSeparator [class]="styles.separator"></div>}</li>
                }
            </ol>
            <div stepsContent [index]="0" [class]="styles.content"><label class="inline-flex items-center gap-2"><input type="checkbox" [checked]="accepted()" (change)="accepted.set($any($event.target).checked)" />I accept the terms</label></div>
            <div stepsContent [index]="1" [class]="styles.content">Your profile</div>
            <div stepsContent [index]="2" [class]="styles.content">All set</div>
            <div [class]="styles.controls">
                <button stepsPrevTrigger [class]="styles.control">Back</button>
                <button stepsNextTrigger [class]="styles.control">Next</button>
            </div>
        </div>
        <pre fixtureOutput [values]="{ step: step(), reason: reason() }"></pre>
    `,
})
export class StepsLinear {
    protected readonly styles = steps;
    protected readonly items = STEPS;
    protected readonly accepted = signal(false);
    protected readonly isStepValid = (index: number) =>
        index !== 0 || this.accepted();
    protected readonly step = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.step.set(event.value);
        this.reason.set(event.details.reason);
    }
}
