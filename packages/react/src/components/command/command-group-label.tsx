import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandGroupContext } from "./command-context.ts";

/** Names its Group. */
export function CommandGroupLabel(props: PartProps<Record<string, never>>) {
    const group = useRequiredContext(CommandGroupContext, "Command.GroupLabel");
    return renderElement(
        "div",
        props,
        {},
        {
            id: group.labelId,
            "data-primitives-part": "command-group-label",
        },
    );
}
