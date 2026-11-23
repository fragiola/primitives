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

/** Groups the Input with its buttons (`role="group"`, spec/number-field.md). */
export const NumberFieldGroup: PartComponent<
    Record<never, never>,
    NumberFieldState
> = publicComponent(
    defineComponent({
        name: "NumberFieldGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NumberFieldKey,
                "NumberField.Group",
            );
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        role: "group",
                        "data-primitives-part": "number-field-group",
                        ...context.attributes(),
                    },
                );
        },
    }),
);
