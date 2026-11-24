import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CascadeSelectContext } from "./cascade-select-context.ts";

/** The floating container of the levels (no role of its own; spec/cascade-select.md). */
export function CascadeSelectPopup(
    props: PartProps<{ open: boolean; side: string; align: string }>,
) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Popup",
    );
    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open: context.open, ...context.placed },
        {
            "data-primitives-part": "cascade-select-popup",
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: context.placed.side,
                align: context.placed.align,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
        context.setPopup,
    );
}
