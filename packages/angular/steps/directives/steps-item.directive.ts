import {
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { dataValues } from "@fragiola/primitives-angular/internal";
import { type StepsItemState, StepsRoot } from "./steps-root.directive.ts";

/** A step's `data-*` values (spec/steps.md, "State attributes and ARIA"). */
export function stepsItemData(state: StepsItemState) {
    return dataValues({
        current: state.current,
        completed: state.completed,
        incomplete: state.incomplete,
        disabled: state.disabled,
        orientation: state.orientation,
    });
}

/**
 * One step (spec/steps.md): `<li stepsItem [index]="0">`, `aria-current="step"` while it is the
 * current one. Its Trigger, Indicator and Separator read it.
 */
@Directive({
    selector: "li[stepsItem]",
    exportAs: "stepsItem",
    host: {
        "data-primitives-part": "steps-item",
        "[attr.aria-current]": "state().current ? 'step' : null",
        "[attr.data-current]": "data().current",
        "[attr.data-completed]": "data().completed",
        "[attr.data-incomplete]": "data().incomplete",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-orientation]": "data().orientation",
    },
})
export class StepsItem {
    /** Its step, from 0. */
    readonly index = input.required({ transform: numberAttribute });
    readonly root = inject(StepsRoot);
    readonly state = computed(() => this.root.itemState(this.index()));
    readonly data = computed(() => stepsItemData(this.state()));
}
