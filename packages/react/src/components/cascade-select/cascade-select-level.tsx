import type { CascadeItem } from "@fragiola/primitives/cascade";
import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    CascadeSelectContext,
    CascadeSelectLevelContext,
} from "./cascade-select-context.ts";

export interface CascadeSelectLevelState {
    open: boolean;
    depth: number;
}

export interface CascadeSelectLevelProps
    extends Omit<PartProps<CascadeSelectLevelState>, "children"> {
    /** The level's depth, `0` for the first. */
    depth: number;
    /** Renders an Item per entry of the level, in order (none while the level is not open). */
    children?: ReactNode | ((items: readonly CascadeItem[]) => ReactNode);
}

const NO_ITEMS: readonly CascadeItem[] = [];

/** The `listbox` of one depth; `hidden` while that depth is not open (spec/cascade-select.md). */
export function CascadeSelectLevel({
    depth,
    children,
    ...props
}: CascadeSelectLevelProps) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Level",
    );
    const items = context.levels[depth] ?? NO_ITEMS;
    const open = depth < context.levels.length;
    const parent = depth > 0 ? context.active[depth - 1] : undefined;
    const content =
        typeof children === "function"
            ? children(open ? items : NO_ITEMS)
            : children;
    return (
        <CascadeSelectLevelContext.Provider value={{ depth, items }}>
            {renderElement(
                "div",
                { ...props, children: content },
                { open, depth },
                {
                    role: "listbox",
                    id: context.levelId(depth),
                    hidden: open ? undefined : true,
                    "aria-labelledby":
                        depth === 0
                            ? context.trigger?.id
                            : parent === undefined
                              ? undefined
                              : context.itemId(depth - 1, parent),
                    "data-depth": String(depth),
                    "data-primitives-part": "cascade-select-level",
                },
            )}
        </CascadeSelectLevelContext.Provider>
    );
}
