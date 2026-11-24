import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandContext } from "./command-context.ts";

export interface CommandSeparatorProps extends PartProps<{ hidden: boolean }> {
    /** Shown while there is text too. */
    forceMount?: boolean;
}

/**
 * Between groups, hidden while there is text (the groups it separates may be hidden); no role of
 * its own (a `listbox` owns only groups and options).
 */
export function CommandSeparator({
    forceMount = false,
    ...props
}: CommandSeparatorProps) {
    const context = useRequiredContext(CommandContext, "Command.Separator");
    const hidden = !forceMount && context.search.trim() !== "";
    return renderElement(
        "div",
        props,
        { hidden },
        {
            role: "presentation",
            hidden: hidden || undefined,
            "data-orientation": "horizontal",
            "data-primitives-part": "command-separator",
        },
    );
}
