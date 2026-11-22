import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { RadioKey, type RadioState, radioAttributes } from "./radio-context.ts";

export interface RadioIndicatorProps {
    /** Rendered in every state, not only while checked. */
    keepMounted?: boolean;
}

/** The dot, hidden from assistive technologies (spec/radio-group.md). */
export const RadioIndicator: PartComponent<RadioIndicatorProps, RadioState> =
    publicComponent(
        defineComponent({
            name: "RadioIndicator",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Rendered in every state, not only while checked. */
                keepMounted: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                const state = useRequiredContext(RadioKey, "Radio.Indicator");
                return () => {
                    const current = state.value;
                    if (!props.keepMounted && !current.checked) {
                        return null;
                    }
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        current,
                        {
                            "aria-hidden": "true",
                            "data-primitives-part": "radio-indicator",
                            ...stateAttributes(radioAttributes(current)),
                        },
                    );
                };
            },
        }),
    );
