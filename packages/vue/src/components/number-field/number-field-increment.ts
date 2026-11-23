import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    NumberFieldKey,
    type NumberFieldState,
} from "./number-field-context.ts";
import { useStepperButton } from "./use-stepper-button.ts";

/**
 * Steps the value up, once or held (spec/number-field.md, "Pointer"); out of the tab order, its
 * name the consumer's.
 */
export const NumberFieldIncrement: PartComponent<
    Record<never, never>,
    NumberFieldState
> = publicComponent(
    defineComponent({
        name: "NumberFieldIncrement",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NumberFieldKey,
                "NumberField.Increment",
            );
            const button = useStepperButton(context, 1);
            return () =>
                renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        type: "button",
                        tabindex: -1,
                        disabled: button.disabled(),
                        "aria-controls": context.inputId(),
                        "data-primitives-part": "number-field-increment",
                        ...context.attributes(),
                        ref: button.ref,
                    },
                );
        },
    }),
);
