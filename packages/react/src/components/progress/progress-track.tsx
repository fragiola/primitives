import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressContext,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

export type ProgressTrackProps = PartProps<ProgressState>;

/** The rail the Indicator fills (spec/progress.md). */
export function ProgressTrack(props: ProgressTrackProps) {
    const context = useRequiredContext(ProgressContext, "Progress.Track");
    return renderElement("div", props, progressState(context), {
        "data-primitives-part": "progress-track",
        ...stateAttributes(statusAttributes(context.status)),
    });
}
