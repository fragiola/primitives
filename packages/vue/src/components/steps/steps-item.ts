import { defineComponent, provide } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    itemAttributes,
    StepsItemKey,
    type StepsItemState,
    StepsKey,
    stepsItemState,
} from "./steps-context.ts";

export interface StepsItemProps {
    /** Its step, from 0. */
    index: number;
}

/** One step (spec/steps.md): `aria-current="step"` while it is the current one. */
export const StepsItem: PartComponent<StepsItemProps, StepsItemState> =
    publicComponent(
        defineComponent({
            name: "StepsItem",
            inheritAttrs: false,
            props: { ...asProp, index: { type: Number, required: true } },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(StepsKey, "Steps.Item");
                provide(StepsItemKey, () => props.index);
                return () => {
                    const state = stepsItemState(context, props.index);
                    return renderPart("li", { attrs, slots }, props.as, state, {
                        "aria-current": state.current ? "step" : undefined,
                        "data-primitives-part": "steps-item",
                        ...itemAttributes(state),
                    });
                };
            },
        }),
    );
