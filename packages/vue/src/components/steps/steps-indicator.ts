import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { StepsItemState } from "./steps-context.ts";
import { useStepsItem } from "./use-steps-item.ts";

/** Its step's number or check mark (spec/steps.md), hidden from assistive technology. */
export const StepsIndicator: PartComponent<
    Record<never, never>,
    StepsItemState
> = publicComponent(
    defineComponent({
        name: "StepsIndicator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { state: read } = useStepsItem("Steps.Indicator");
            return () => {
                const state = read();
                return renderPart("span", { attrs, slots }, props.as, state, {
                    "aria-hidden": "true",
                    "data-primitives-part": "steps-indicator",
                    ...stateAttributes({
                        current: state.current,
                        completed: state.completed,
                        incomplete: state.incomplete,
                    }),
                });
            };
        },
    }),
);
