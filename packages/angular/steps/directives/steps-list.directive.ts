import { Directive, inject } from "@angular/core";
import { StepsRoot } from "./steps-root.directive.ts";

/** The steps, an ordered list (spec/steps.md): `<ol stepsList aria-label="Checkout">`. */
@Directive({
    selector: "ol[stepsList]",
    exportAs: "stepsList",
    host: {
        "data-primitives-part": "steps-list",
        "[attr.data-orientation]": "root.orientation()",
    },
})
export class StepsList {
    protected readonly root = inject(StepsRoot);
    readonly state = this.root.state;
}
