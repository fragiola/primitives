import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ProgressContext,
    type ProgressState,
    progressState,
    statusAttributes,
} from "./progress-context.ts";

export interface ProgressLabelProps extends PartProps<ProgressState> {
    id?: string;
}

/** Names the progress bar (`aria-labelledby`, spec/progress.md). */
export function ProgressLabel({ id: idProp, ...props }: ProgressLabelProps) {
    const context = useRequiredContext(ProgressContext, "Progress.Label");
    const generated = useId();
    const id = idProp ?? generated;
    const { setLabelId } = context;
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);
    return renderElement("span", props, progressState(context), {
        id,
        "data-primitives-part": "progress-label",
        ...stateAttributes(statusAttributes(context.status)),
    });
}
