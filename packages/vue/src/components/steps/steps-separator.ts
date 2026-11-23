import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { StepsItemState } from "./steps-context.ts";
import { useStepsItem } from "./use-steps-item.ts";

/** The line from its step to the next (spec/steps.md), hidden from assistive technology. */
export const StepsSeparator: PartComponent<
    Record<never, never>,
    StepsItemState
> = publicComponent(
    defineComponent({
        name: "StepsSeparator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { state: read } = useStepsItem("Steps.Separator");
            return () => {
                const state = read();
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "aria-hidden": "true",
                    "data-primitives-part": "steps-separator",
                    ...stateAttributes({
                        current: state.current,
                        completed: state.completed,
                        incomplete: state.incomplete,
                        orientation: state.orientation,
                    }),
                });
            };
        },
    }),
);
