import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { useRovingItem } from "../../hooks/use-roving-item.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext } from "./toolbar-context.ts";

export interface ToolbarLinkState {
    orientation: "horizontal" | "vertical";
}

export type ToolbarLinkProps = PartProps<ToolbarLinkState>;

/** A link of a toolbar (spec/toolbar.md): an item of the toolbar's focus; it cannot be disabled. */
export function ToolbarLink(props: ToolbarLinkProps) {
    const { orientation } = useRequiredContext(ToolbarContext, "Toolbar.Link");
    const item = useRovingItem(true);
    return renderElement(
        "a",
        props,
        { orientation },
        {
            tabIndex: item?.tabIndex,
            "data-primitives-part": "toolbar-link",
            ...stateAttributes({ orientation }),
            onFocus: item?.onFocus,
        },
        item?.ref,
    );
}
