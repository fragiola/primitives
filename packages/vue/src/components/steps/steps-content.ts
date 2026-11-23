import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type StepsItemState,
    StepsKey,
    stepsContentId,
    stepsItemState,
} from "./steps-context.ts";

export interface StepsContentProps {
    /** Its step, from 0. */
    index: number;
}

/** The content of one step (spec/steps.md): `hidden` unless it is the current one. */
export const StepsContent: PartComponent<StepsContentProps, StepsItemState> =
    publicComponent(
        defineComponent({
            name: "StepsContent",
            inheritAttrs: false,
            props: { ...asProp, index: { type: Number, required: true } },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(StepsKey, "Steps.Content");
                return () => {
                    const state = stepsItemState(context, props.index);
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            id: stepsContentId(context.baseId, props.index),
                            hidden: !state.current,
                            "data-primitives-part": "steps-content",
                            ...stateAttributes({ current: state.current }),
                        },
                    );
                };
            },
        }),
    );
