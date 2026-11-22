import { Component } from "@angular/core";
import {
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    AccordionRoot,
    AccordionTrigger,
} from "@fragiola/primitives-angular/accordion";
import { styles } from "./styles.ts";

const QUESTIONS = [
    {
        value: "shipping",
        question: "How long does shipping take?",
        answer: "Orders ship within two business days and arrive in three to five.",
    },
    {
        value: "returns",
        question: "Can I return an item?",
        answer: "Returns are free for thirty days, in the original packaging.",
    },
    {
        value: "warranty",
        question: "Is there a warranty?",
        answer: "Every product has a two-year warranty against defects.",
    },
    {
        value: "support",
        question: "How do I reach support?",
        answer: "Write to the support team from your account page, any day.",
    },
];

// Frequently asked questions: one answer open at a time, the arrow keys, Home and End move between
// the questions, and the closed answers are hidden until found, so find-in-page opens the one that
// matches (spec/accordion.md).
@Component({
    selector: "example-faq",
    imports: [
        AccordionRoot,
        AccordionItem,
        AccordionHeader,
        AccordionTrigger,
        AccordionPanel,
    ],
    template: `
        <div accordionRoot [defaultValue]="['shipping']" [class]="styles.root">
            @for (item of questions; track item.value) {
                <div accordionItem [value]="item.value" [class]="styles.item">
                    <h3 accordionHeader [class]="styles.header">
                        <button accordionTrigger [class]="styles.trigger">{{ item.question }}</button>
                    </h3>
                    <div *accordionPanel="{ hiddenUntilFound: true }" [class]="styles.panel">
                        <p [class]="styles.text">{{ item.answer }}</p>
                    </div>
                </div>
            }
        </div>
    `,
})
export default class Faq {
    protected readonly styles = styles;
    protected readonly questions = QUESTIONS;
}
