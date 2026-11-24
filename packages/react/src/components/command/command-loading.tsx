import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandContext } from "./command-context.ts";

/** A polite live region, always rendered; its children only while the Root is `loading`. */
export function CommandLoading({
    children,
    ...props
}: PartProps<Record<string, never>>) {
    const context = useRequiredContext(CommandContext, "Command.Loading");
    return renderElement(
        "div",
        { ...props, children: context.loading ? children : null },
        {},
        {
            role: "status",
            "aria-live": "polite",
            "aria-atomic": "true",
            "data-primitives-part": "command-loading",
        },
    );
}
