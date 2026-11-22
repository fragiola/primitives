import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressContext,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

export interface ProgressValueProps
    extends Omit<PartProps<ProgressState>, "children"> {
    /** Its content: a node, or a function of the formatted value and the value. */
    children?:
        | ReactNode
        | ((formattedValue: string, value: number | null) => ReactNode);
}

/** Shows the formatted value, empty while indeterminate (spec/progress.md). */
export function ProgressValue({ children, ...props }: ProgressValueProps) {
    const context = useRequiredContext(ProgressContext, "Progress.Value");
    const content =
        typeof children === "function"
            ? children(context.formattedValue, context.value)
            : (children ?? context.formattedValue);
    return renderElement(
        "span",
        { ...props, children: content },
        progressState(context),
        {
            "data-primitives-part": "progress-value",
            ...stateAttributes(statusAttributes(context.status)),
        },
    );
}
