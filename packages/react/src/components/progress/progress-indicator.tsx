import type { CSSProperties } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressContext,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

export type ProgressIndicatorProps = PartProps<ProgressState>;

/**
 * The filled part, from the inline start (spec/progress.md): its structural style sets its
 * inline size, and `--progress-indicator-size`; none while indeterminate.
 */
export function ProgressIndicator(props: ProgressIndicatorProps) {
    const context = useRequiredContext(ProgressContext, "Progress.Indicator");
    const { percent } = context;
    const style =
        percent === null
            ? undefined
            : ({
                  insetInlineStart: 0,
                  inlineSize: `${percent}%`,
                  "--progress-indicator-size": `${percent}%`,
              } as CSSProperties);
    return renderElement("div", props, progressState(context), {
        style,
        "data-primitives-part": "progress-indicator",
        ...stateAttributes(statusAttributes(context.status)),
    });
}
