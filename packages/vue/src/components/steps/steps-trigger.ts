import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    itemAttributes,
    type StepsItemState,
    stepsContentId,
} from "./steps-context.ts";
import { useStepsItem } from "./use-steps-item.ts";

/** Moves to its Item's step (spec/steps.md): disabled while that step cannot be reached. */
export const StepsTrigger: PartComponent<
    Record<never, never>,
    StepsItemState
> = publicComponent(
    defineComponent({
        name: "StepsTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { context, state: read } = useStepsItem("Steps.Trigger");
            return () => {
                const state = read();
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    disabled: state.disabled || undefined,
                    "aria-current": state.current ? "step" : undefined,
                    "aria-controls": stepsContentId(
                        context.baseId,
                        state.index,
                    ),
                    onClick: (event: MouseEvent) => {
                        if (state.disabled) {
                            return;
                        }
                        context.setStep(state.index, {
                            reason: "trigger-press",
                            event,
                        });
                    },
                    "data-primitives-part": "steps-trigger",
                    ...itemAttributes(state),
                });
            };
        },
    }),
);
