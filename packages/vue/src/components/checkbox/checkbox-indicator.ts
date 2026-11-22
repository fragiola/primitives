import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { CheckboxState } from "./checkbox-context.ts";
import { CheckboxKey, checkedAttributes } from "./checkbox-context.ts";

export interface CheckboxIndicatorProps {
    /** Rendered in every state, not only while checked or indeterminate. */
    keepMounted?: boolean;
}

/** The check or the dash, hidden from assistive technologies (spec/checkbox.md). */
export const CheckboxIndicator: PartComponent<
    CheckboxIndicatorProps,
    CheckboxState
> = publicComponent(
    defineComponent({
        name: "CheckboxIndicator",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Rendered in every state, not only while checked or indeterminate. */
            keepMounted: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const state = useRequiredContext(CheckboxKey, "Checkbox.Indicator");
            return () => {
                const current = state.value;
                if (
                    !props.keepMounted &&
                    !current.checked &&
                    !current.indeterminate
                ) {
                    return null;
                }
                return renderPart("span", { attrs, slots }, props.as, current, {
                    "aria-hidden": "true",
                    "data-primitives-part": "checkbox-indicator",
                    ...stateAttributes(checkedAttributes(current)),
                });
            };
        },
    }),
);
