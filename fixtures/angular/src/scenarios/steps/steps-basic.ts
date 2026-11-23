import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/steps";
import { steps } from "examples-shared/recipes/steps";
import { Output } from "../../kit/output.ts";
import { STEPS_PARTS } from "./steps-parts.ts";

const STEPS = [
    { title: "Shipping", content: "Shipping address" },
    { title: "Payment", content: "Payment method" },
    { title: "Review", content: "Review your order" },
];

/** spec/steps.md, `/steps/basic` */
@Component({
    selector: "[scenario-steps-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [STEPS_PARTS, Output],
    template: `
        <div stepsRoot [count]="items.length" (stepChangeDetails)="report($event)" [class]="styles.root">
            <ol stepsList aria-label="Checkout" [class]="styles.list">
                @for (item of items; track item.title; let index = $index, last = $last) {
                    <li stepsItem [index]="index" [class]="styles.item"><button stepsTrigger [class]="styles.trigger"><span stepsIndicator [class]="styles.indicator">{{ index + 1 }}</span>{{ item.title }}</button>@if (!last) {<div stepsSeparator [class]="styles.separator"></div>}</li>
                }
            </ol>
            @for (item of items; track item.title; let index = $index) {
                <div stepsContent [index]="index" [class]="styles.content">{{ item.content }}</div>
            }
            <div stepsCompletedContent [class]="styles.content">Order placed</div>
            <div [class]="styles.controls">
                <button stepsPrevTrigger [class]="styles.control">Back</button>
                <button stepsNextTrigger [class]="styles.control">Continue</button>
            </div>
        </div>
        <pre fixtureOutput [values]="{ step: step(), reason: reason() }"></pre>
    `,
})
export class StepsBasic {
    protected readonly styles = steps;
    protected readonly items = STEPS;
    protected readonly step = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected report(event: ValueChangeEvent<number>): void {
        this.step.set(event.value);
        this.reason.set(event.details.reason);
    }
}
