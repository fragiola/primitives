import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { StepsRoot } from "./steps-root.directive.ts";

/** The content of one step (spec/steps.md): `<div stepsContent [index]="0">`, `hidden` unless current. */
@Directive({
    selector: "[stepsContent]",
    exportAs: "stepsContent",
    host: {
        "data-primitives-part": "steps-content",
        "[attr.id]": "root.contentId(index())",
        "[attr.hidden]": "state().current ? null : ''",
        "[attr.data-current]": "state().current ? '' : null",
    },
})
export class StepsContent {
    /** Its step, from 0. */
    readonly index = input.required({ transform: numberAttribute });
    protected readonly root = inject(StepsRoot);
    readonly state = computed(() => this.root.itemState(this.index()));
}
