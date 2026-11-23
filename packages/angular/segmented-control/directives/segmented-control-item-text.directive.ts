import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import {
    SegmentedControlItem,
    type SegmentedControlItemState,
} from "./segmented-control-item.directive.ts";

/** An Item's text (spec/segmented-control.md), with its Item's state: `<span segmentedControlItemText>`. */
@Directive({
    selector: "[segmentedControlItemText]",
    exportAs: "segmentedControlItemText",
    host: {
        "data-primitives-part": "segmented-control-item-text",
        "[attr.data-checked]": "data().checked",
        "[attr.data-unchecked]": "data().unchecked",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class SegmentedControlItemText {
    private readonly item = injectEnclosing(
        SegmentedControlItem,
        "segmentedControlItem",
        "segmentedControlItemText",
    );
    readonly state = computed<SegmentedControlItemState>(() =>
        this.item.state(),
    );
    protected readonly data = computed(() => {
        const state = this.state();
        return dataValues({
            checked: state.checked,
            unchecked: !state.checked,
            disabled: state.disabled,
        });
    });
}
