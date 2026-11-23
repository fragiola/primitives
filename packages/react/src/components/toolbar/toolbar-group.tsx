import { useContext, useMemo } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { RovingContext } from "../../utils/roving-context.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext, type ToolbarItemState } from "./toolbar-context.ts";

export interface ToolbarGroupProps extends PartProps<ToolbarItemState> {
    /** Every item in it is disabled. */
    disabled?: boolean;
}

/**
 * A group of a toolbar's items (spec/toolbar.md): no focus of its own; it passes its `disabled`
 * on to the items inside it through the toolbar's roving scope ("Nested composites").
 */
export function ToolbarGroup({
    disabled: disabledProp = false,
    children,
    ...props
}: ToolbarGroupProps) {
    const { orientation } = useRequiredContext(ToolbarContext, "Toolbar.Group");
    const scope = useContext(RovingContext);
    const disabled = disabledProp || (scope?.disabled ?? false);
    const inner = useMemo(
        () => (scope === null ? null : { ...scope, disabled }),
        [scope, disabled],
    );
    return renderElement(
        "div",
        {
            ...props,
            children: (
                <RovingContext.Provider value={inner}>
                    {children}
                </RovingContext.Provider>
            ),
        },
        { orientation, disabled },
        {
            role: "group",
            "data-primitives-part": "toolbar-group",
            ...stateAttributes({ orientation, disabled }),
        },
    );
}
