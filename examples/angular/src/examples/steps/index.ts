import { Component, signal } from "@angular/core";
import {
    StepsCompletedContent,
    StepsContent,
    StepsIndicator,
    StepsItem,
    StepsList,
    StepsNextTrigger,
    StepsPrevTrigger,
    StepsRoot,
    StepsSeparator,
    StepsTrigger,
} from "@fragiola/primitives-angular/steps";
import { styles } from "./styles.ts";

const STEPS = ["Shipping", "Payment", "Review"];

// A linear checkout (spec/steps.md): Continue, and the steps after Shipping, wait until the
// shipping name is filled in (`isStepValid`); the last Continue reaches the completed state.
@Component({
    selector: "example-checkout-stepper",
    imports: [
        StepsRoot,
        StepsList,
        StepsItem,
        StepsTrigger,
        StepsIndicator,
        StepsSeparator,
        StepsContent,
        StepsCompletedContent,
        StepsPrevTrigger,
        StepsNextTrigger,
    ],
    template: `
        <div stepsRoot [count]="steps.length" linear [isStepValid]="isStepValid" [class]="styles.root">
            <ol stepsList aria-label="Checkout" [class]="styles.list">
                @for (title of steps; track title; let index = $index, last = $last) {
                    <li stepsItem [index]="index" [class]="styles.item">
                        <button stepsTrigger [class]="styles.trigger"><span stepsIndicator [class]="styles.indicator">{{ index + 1 }}</span>{{ title }}</button>
                        @if (!last) {
                            <div stepsSeparator [class]="styles.separator"></div>
                        }
                    </li>
                }
            </ol>
            <div stepsContent [index]="0" [class]="styles.content">
                <label [class]="styles.label">
                    Full name
                    <input [value]="name()" (input)="name.set($any($event.target).value)" autocomplete="name" [class]="styles.input" />
                </label>
            </div>
            <div stepsContent [index]="1" [class]="styles.content">
                <p [class]="styles.text">Pay by card on delivery.</p>
            </div>
            <div stepsContent [index]="2" [class]="styles.content">
                <p [class]="styles.text">Ship to {{ name() }}, pay on delivery.</p>
            </div>
            <div stepsCompletedContent [class]="styles.content">
                <p>Order placed</p>
            </div>
            <div [class]="styles.controls">
                <button stepsPrevTrigger [class]="styles.control">Back</button>
                <button stepsNextTrigger [class]="styles.control">Continue</button>
            </div>
        </div>
    `,
})
export default class CheckoutStepper {
    protected readonly styles = styles;
    protected readonly steps = STEPS;
    protected readonly name = signal("");
    protected readonly isStepValid = (index: number) =>
        index !== 0 || this.name().trim() !== "";
}
