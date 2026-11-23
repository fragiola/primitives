import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsKey, type StepsState } from "./steps-context.ts";

/** The steps, an ordered list (spec/steps.md); the app names it. */
export const StepsList: PartComponent<
    Record<never, never>,
    StepsState
> = publicComponent(
    defineComponent({
        name: "StepsList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(StepsKey, "Steps.List");
            return () => {
                const state = context.state();
                return renderPart("ol", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "steps-list",
                    ...stateAttributes({ orientation: state.orientation }),
                });
            };
        },
    }),
);
