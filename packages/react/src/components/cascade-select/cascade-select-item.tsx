import { hasCascadeChildren } from "@fragiola/primitives/cascade";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { isInSafeArea } from "@fragiola/primitives/pointer";
import {
    type MouseEvent as ReactMouseEvent,
    type PointerEvent as ReactPointerEvent,
    useLayoutEffect,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CascadeSelectContext,
    CascadeSelectItemContext,
    CascadeSelectLevelContext,
    samePath,
} from "./cascade-select-context.ts";

export interface CascadeSelectItemState {
    highlighted: boolean;
    selected: boolean;
    disabled: boolean;
    hasChildren: boolean;
    expanded: boolean;
}

export interface CascadeSelectItemProps
    extends PartProps<CascadeSelectItemState> {
    /** The entry's `value` among its Level's items. */
    value: string;
}

// Menu's SubmenuTrigger default (spec/menu.md): the hover time before a parent opens its level.
const HOVER_DELAY = 100;

/** An `option`: a parent opens its level, a leaf is chosen (spec/cascade-select.md). */
export function CascadeSelectItem({ value, ...props }: CascadeSelectItemProps) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Item",
    );
    const level = useRequiredContext(
        CascadeSelectLevelContext,
        "CascadeSelect.Item",
    );
    const element = useRef<HTMLElement | null>(null);
    // the pointer's last position over the item: where a jump left it (a leave event carries the
    // new position, already over the next item)
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const { depth } = level;
    const entry = level.items.find((item) => item.value === value);
    const disabled = entry?.disabled ?? false;
    const hasChildren = hasCascadeChildren(entry);
    const { active, peek, levels, positioner } = context;
    const path = [...active.slice(0, depth), value];
    const highlighted = active.length - 1 === depth && active[depth] === value;
    const expanded =
        hasChildren && active[depth] === value && depth + 1 < levels.length;
    const selected = samePath(context.value.slice(0, depth + 1), path);
    useLayoutEffect(() => {
        if (highlighted && element.current !== null) {
            scrollIntoViewWithin(element.current, positioner);
        }
    }, [highlighted, positioner]);

    const startHover = () => {
        clearTimeout(context.hoverTimer.current);
        context.hoverTimer.current = undefined;
        if (!hasChildren || disabled) {
            return;
        }
        context.hoverTimer.current = setTimeout(() => {
            context.hoverTimer.current = undefined;
            context.setActive(path, true);
        }, HOVER_DELAY);
    };
    const onPointerMove = (event: ReactPointerEvent) => {
        lastPoint.current = { x: event.clientX, y: event.clientY };
        // the safe area: the pointer travels from an open parent of this level to its level
        const area = context.safeArea.current;
        const levelElement =
            area === null
                ? null
                : element.current?.ownerDocument.getElementById(
                      context.levelId(area.depth),
                  );
        if (
            area !== null &&
            levelElement &&
            !levelElement.hidden &&
            area.depth === depth + 1 &&
            active[depth] !== value &&
            isInSafeArea(
                { x: event.clientX, y: event.clientY },
                area,
                levelElement,
            )
        ) {
            return;
        }
        if (highlighted) {
            if (!peek && context.hoverTimer.current === undefined) {
                startHover();
            }
            return;
        }
        if (active[depth] === value && expanded) {
            // back on the open parent: its level stays open
            context.setActive(path, true);
            return;
        }
        context.setActive(path);
        startHover();
    };
    const state = { highlighted, selected, disabled, hasChildren, expanded };
    return (
        <CascadeSelectItemContext.Provider value={state}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "option",
                    id: context.itemId(depth, value),
                    "aria-selected": selected ? "true" : "false",
                    "aria-disabled": disabled ? "true" : undefined,
                    "aria-controls": expanded
                        ? context.levelId(depth + 1)
                        : undefined,
                    "data-primitives-part": "cascade-select-item",
                    ...stateAttributes({
                        highlighted,
                        selected,
                        disabled,
                        "has-children": hasChildren,
                        expanded,
                    }),
                    onPointerMove,
                    onPointerLeave: (event: ReactPointerEvent) => {
                        clearTimeout(context.hoverTimer.current);
                        context.hoverTimer.current = undefined;
                        const from = lastPoint.current ?? {
                            x: event.clientX,
                            y: event.clientY,
                        };
                        lastPoint.current = null;
                        if (expanded) {
                            context.safeArea.current = {
                                ...from,
                                depth: depth + 1,
                            };
                        }
                    },
                    // the trigger keeps DOM focus
                    onPointerDown: (event: PointerEvent) =>
                        event.preventDefault(),
                    onClick: (event: ReactMouseEvent) => {
                        if (disabled) {
                            return;
                        }
                        clearTimeout(context.hoverTimer.current);
                        context.hoverTimer.current = undefined;
                        if (hasChildren) {
                            if (context.changeOnSelect) {
                                context.choose(
                                    path,
                                    "item-press",
                                    event.nativeEvent,
                                    true,
                                );
                            }
                            context.setActive(path, true);
                            return;
                        }
                        context.choose(path, "item-press", event.nativeEvent);
                    },
                },
                (node: HTMLElement | null) => {
                    element.current = node;
                },
            )}
        </CascadeSelectItemContext.Provider>
    );
}
