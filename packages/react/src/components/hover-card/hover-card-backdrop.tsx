import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardContext } from "./hover-card-context.ts";

/** Behind the card while it shows; takes no pointer (spec/hover-card.md). */
export function HoverCardBackdrop(props: PartProps<{ open: boolean }>) {
    const context = useRequiredContext(HoverCardContext, "HoverCard.Backdrop");
    const { open } = context;
    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            "data-primitives-part": "hover-card-backdrop",
            ...stateAttributes({
                open,
                closed: !open,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
            style: { pointerEvents: "none" },
        },
    );
}
