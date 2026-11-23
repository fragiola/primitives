import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SegmentedControlItemKey,
    type SegmentedControlItemState,
} from "./segmented-control-context.ts";

/** An Item's text (spec/segmented-control.md), with its Item's state. */
export const SegmentedControlItemText: PartComponent<
    Record<never, never>,
    SegmentedControlItemState
> = publicComponent(
    defineComponent({
        name: "SegmentedControlItemText",
        inheritAttrs: false,
        props: { ...asProp },
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                SegmentedControlItemKey,
                "SegmentedControl.ItemText",
            );
            return () => {
                const state = item.value;
                return renderPart("span", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "segmented-control-item-text",
                    ...stateAttributes({
                        checked: state.checked,
                        unchecked: !state.checked,
                        disabled: state.disabled,
                    }),
                });
            };
        },
    }),
);
