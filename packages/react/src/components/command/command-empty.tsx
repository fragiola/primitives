import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandContext } from "./command-context.ts";

/**
 * A polite live region, always rendered; its children only while no Item is shown and nothing
 * loads, once mounted (spec/command.md).
 */
export function CommandEmpty({
    children,
    ...props
}: PartProps<Record<string, never>>) {
    const context = useRequiredContext(CommandContext, "Command.Empty");
    const empty = context.shownCount === 0 && !context.loading;
    return renderElement(
        "div",
        { ...props, children: empty ? children : null },
        {},
        {
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
            "data-primitives-part": "command-empty",
        },
    );
}
