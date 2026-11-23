import {
    labelFocusTarget,
    preventLabelSelection,
} from "@fragiola/primitives/form";
import type { MouseEvent } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** A Label has no state of its own (spec/label.md). */
export type LabelState = Record<string, never>;

export interface LabelProps extends PartProps<LabelState> {
    /** The `id` of the control it names; without it, the labelable control it wraps. */
    htmlFor?: string;
}

const STATE: LabelState = {};

/**
 * A `<label>` (spec/label.md): it names its control by `htmlFor` or by wrapping it, a press
 * reaches the control (or focuses the element `htmlFor` names when that is no labelable one), and
 * a double press selects none of its text.
 */
export function Label(props: LabelProps) {
    return renderElement("label", props, STATE, {
        onMouseDown: (event: MouseEvent<HTMLLabelElement>) => {
            preventLabelSelection(event.nativeEvent);
        },
        onClick: (event: MouseEvent<HTMLLabelElement>) => {
            if (event.defaultPrevented) {
                return;
            }
            labelFocusTarget(event.currentTarget)?.focus();
        },
        "data-primitives-part": "label-root",
    });
}
