import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** What an AspectRatio renders with (spec/aspect-ratio.md). */
export interface AspectRatioState {
    /** The width over the height. */
    ratio: number;
}

export interface AspectRatioProps extends PartProps<AspectRatioState> {
    /** The width over the height (default `1`; not a positive finite number: `1`). */
    ratio?: number;
}

/**
 * A box that keeps its content at a ratio (spec/aspect-ratio.md): a structural
 * `aspect-ratio`, and nothing else.
 */
export function AspectRatio({
    ratio: ratioProp = 1,
    ...props
}: AspectRatioProps) {
    const ratio = Number.isFinite(ratioProp) && ratioProp > 0 ? ratioProp : 1;
    return renderElement(
        "div",
        props,
        { ratio },
        {
            style: { aspectRatio: String(ratio), minHeight: 0 },
            "data-primitives-part": "aspect-ratio-root",
        },
    );
}
