import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** What an AspectRatio renders with (spec/aspect-ratio.md). */
export interface AspectRatioState {
    /** The width over the height. */
    ratio: number;
}

export interface AspectRatioProps {
    /** The width over the height (default `1`; not a positive finite number: `1`). */
    ratio?: number;
}

/**
 * A box that keeps its content at a ratio (spec/aspect-ratio.md): a structural
 * `aspect-ratio`, and nothing else.
 */
export const AspectRatio: PartComponent<AspectRatioProps, AspectRatioState> =
    publicComponent(
        defineComponent({
            name: "AspectRatio",
            inheritAttrs: false,
            props: {
                ...asProp,
                ratio: { type: Number, default: 1 },
            },
            setup(props, { attrs, slots }) {
                return () => {
                    const ratio =
                        Number.isFinite(props.ratio) && props.ratio > 0
                            ? props.ratio
                            : 1;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { ratio },
                        {
                            style: { aspectRatio: String(ratio), minHeight: 0 },
                            "data-primitives-part": "aspect-ratio-root",
                        },
                    );
                };
            },
        }),
    );
