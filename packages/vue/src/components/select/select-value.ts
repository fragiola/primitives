import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SelectKey } from "./select-context.ts";

export interface SelectValueState {
    placeholder: boolean;
}

export interface SelectValueProps {
    /** Shown while nothing is selected. */
    placeholder?: string;
}

/** The selected item's label, or the placeholder (spec/select.md). */
export const SelectValue: PartComponent<SelectValueProps, SelectValueState> =
    publicComponent(
        defineComponent({
            name: "SelectValue",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Shown while nothing is selected. */
                placeholder: { type: String, default: undefined },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(SelectKey, "Select.Value");
                return () => {
                    const label = context
                        .items()
                        .find(
                            (item) => item.value === context.value.value,
                        )?.label;
                    const placeholder = label === undefined;
                    return renderPart(
                        "span",
                        { attrs, slots },
                        props.as,
                        { placeholder },
                        {
                            "data-primitives-part": "select-value",
                            ...stateAttributes({ placeholder }),
                        },
                        () =>
                            slots.default?.({ placeholder }) ??
                            (placeholder ? props.placeholder : label),
                    );
                };
            },
        }),
    );
