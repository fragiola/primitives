import { defineComponent, type PropType } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";

export interface SeparatorState {
    orientation: "horizontal" | "vertical";
    decorative: boolean;
}

export interface SeparatorProps {
    orientation?: "horizontal" | "vertical";
    /** Hidden from assistive technologies (`role="none"`). */
    decorative?: boolean;
}

/** A divider between sections or groups (spec/separator.md, the ARIA separator, not focusable). */
export const Separator: PartComponent<SeparatorProps, SeparatorState> =
    publicComponent(
        defineComponent({
            name: "SeparatorRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                orientation: {
                    type: String as PropType<"horizontal" | "vertical">,
                    default: "horizontal",
                },
                /** Hidden from assistive technologies (`role="none"`). */
                decorative: { type: Boolean, default: false },
            },
            setup(props, { attrs, slots }) {
                return () => {
                    const { orientation, decorative } = props;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { orientation, decorative },
                        {
                            role: decorative ? "none" : "separator",
                            "aria-orientation": decorative
                                ? undefined
                                : orientation,
                            "data-primitives-part": "separator-root",
                            ...stateAttributes({ orientation }),
                        },
                    );
                };
            },
        }),
    );
