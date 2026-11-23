import { getDirection } from "@fragiola/primitives/direction";
import {
    fractionAlong,
    ratingItemState,
    ratingValueAt,
} from "@fragiola/primitives/range";
import {
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
    useLayoutEffect,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { RatingContext } from "./rating-context.ts";

/** A star's state (spec/rating.md, "API"). */
export interface RatingItemState {
    index: number;
    checked: boolean;
    highlighted: boolean;
    half: boolean;
    disabled: boolean;
    readOnly: boolean;
}

export interface RatingItemProps
    extends Omit<PartProps<RatingItemState>, "children"> {
    /** The star's number, `1` to `count`: its whole value. */
    index: number;
    children?: ReactNode | ((state: RatingItemState) => ReactNode);
}

/** The value under the pointer on a star (spec/rating.md, "Pointer"). */
function valueAt(
    event: { clientX: number; clientY: number; currentTarget: HTMLElement },
    index: number,
    allowHalf: boolean,
): number {
    const star = event.currentTarget;
    const fraction = fractionAlong(
        star.getBoundingClientRect(),
        { x: event.clientX, y: event.clientY },
        "horizontal",
        getDirection(star) === "rtl",
    );
    return ratingValueAt(index, fraction, allowHalf);
}

/** A star: a `radio` of the Rating (spec/rating.md). */
export function RatingItem({ index, children, ...props }: RatingItemProps) {
    const rating = useRequiredContext(RatingContext, "Rating.Item");
    const [element, ref] = useElement<HTMLElement>();
    const { registerItem } = rating;
    useLayoutEffect(
        () => (element === null ? undefined : registerItem(index, element)),
        [registerItem, index, element],
    );

    const interactive = !rating.disabled && !rating.readOnly;
    const state: RatingItemState = {
        index,
        ...ratingItemState(index, rating.value, rating.displayed),
        disabled: rating.disabled,
        readOnly: rating.readOnly,
    };
    return renderElement(
        "button",
        {
            ...props,
            children:
                typeof children === "function" ? children(state) : children,
        },
        state,
        {
            type: "button",
            role: "radio",
            disabled: rating.disabled,
            "aria-checked": state.checked ? "true" : "false",
            tabIndex: rating.tabStop === index ? 0 : -1,
            "data-primitives-part": "rating-item",
            ...stateAttributes({
                checked: state.checked,
                unchecked: !state.checked,
                highlighted: state.highlighted,
                half: state.half,
                disabled: rating.disabled,
                readonly: rating.readOnly,
            }),
            onPointerMove: (event: PointerEvent<HTMLElement>) => {
                // a mouse or a pen previews the value under it; a touch has no hover
                if (interactive && event.pointerType !== "touch") {
                    rating.preview(valueAt(event, index, rating.allowHalf));
                }
            },
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (!interactive) {
                    return;
                }
                event.currentTarget.focus();
                // a click with no pointer (a label's, a script's) chooses the whole star
                const next =
                    event.detail === 0
                        ? index
                        : valueAt(event, index, rating.allowHalf);
                if (next !== rating.value) {
                    rating.choose(next, "item-press", event.nativeEvent);
                } else if (rating.allowClear) {
                    rating.choose(0, "item-press", event.nativeEvent);
                }
            },
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                // a native radio does not check on Enter (a button would click)
                if (event.key === "Enter") {
                    event.preventDefault();
                    return;
                }
                if (event.key === " ") {
                    // Space is a key, not a press: its click on key up is prevented
                    event.preventDefault();
                }
                if (rating.keyDown(event.key, index, event.nativeEvent)) {
                    event.preventDefault();
                }
            },
            onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
                if (event.key === " ") {
                    event.preventDefault();
                }
            },
        },
        ref,
    );
}
