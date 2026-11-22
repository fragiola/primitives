import { useId, useMemo, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NavigationMenuContext,
    NavigationMenuItemContext,
} from "./navigation-menu-context.ts";

export interface NavigationMenuItemProps
    extends PartProps<Record<string, never>> {
    /** The item's value (generated when not given). */
    value?: string;
}

/** One item: a Trigger with its Content, or a Link (spec/navigation-menu.md). */
export function NavigationMenuItem({
    value: valueProp,
    children,
    ...props
}: NavigationMenuItemProps) {
    useRequiredContext(NavigationMenuContext, "NavigationMenu.Item");
    const generated = useId();
    const value = valueProp ?? generated;
    const [content, setContent] = useState<HTMLElement | null>(null);
    const item = useMemo(
        () => ({
            value,
            contentId: `${generated}-content`,
            content,
            setContent,
        }),
        [value, generated, content],
    );
    return (
        <NavigationMenuItemContext.Provider value={item}>
            {renderElement(
                "li",
                { ...props, children },
                {},
                { "data-primitives-part": "navigation-menu-item" },
            )}
        </NavigationMenuItemContext.Provider>
    );
}
