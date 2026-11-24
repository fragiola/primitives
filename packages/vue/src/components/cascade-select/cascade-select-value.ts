import { cascadePathItems } from "@fragiola/primitives/cascade";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CascadeSelectKey } from "./cascade-select-context.ts";

export interface CascadeSelectValueState {
    placeholder: boolean;
}

export interface CascadeSelectValueProps {
    /** Shown while nothing is chosen. */
    placeholder?: string;
    /** Joins the labels of the whole path; without it, the last chosen item's label. */
    separator?: string;
}

/** The chosen path's label, or the placeholder (spec/cascade-select.md). */
export const CascadeSelectValue: PartComponent<
    CascadeSelectValueProps,
    CascadeSelectValueState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectValue",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** Shown while nothing is chosen. */
            placeholder: { type: String, default: undefined },
            /** Joins the labels of the whole path; without it, the last chosen item's label. */
            separator: { type: String, default: undefined },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Value",
            );
            return () => {
                const found =
                    cascadePathItems(context.items(), context.value.value) ??
                    [];
                const labels = found.map((item) => item.label);
                const label =
                    labels.length === 0
                        ? undefined
                        : props.separator === undefined
                          ? labels.at(-1)
                          : labels.join(props.separator);
                const placeholder = label === undefined;
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { placeholder },
                    {
                        "data-primitives-part": "cascade-select-value",
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
