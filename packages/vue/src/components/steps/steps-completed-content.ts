import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { StepsKey, type StepsState } from "./steps-context.ts";

/** What shows once every step is done (spec/steps.md): `hidden` until then. */
export const StepsCompletedContent: PartComponent<
    Record<never, never>,
    StepsState
> = publicComponent(
    defineComponent({
        name: "StepsCompletedContent",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                StepsKey,
                "Steps.CompletedContent",
            );
            return () => {
                const state = context.state();
                return renderPart("div", { attrs, slots }, props.as, state, {
                    hidden: !state.completed,
                    "data-primitives-part": "steps-completed-content",
                });
            };
        },
    }),
);
