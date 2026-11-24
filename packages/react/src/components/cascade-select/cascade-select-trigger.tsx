import {
    cascadeKeyAction,
    cascadePathItems,
    hasCascadeChildren,
} from "@fragiola/primitives/cascade";
import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { type KeyboardEvent, type MouseEvent, useContext, useRef } from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CascadeSelectContext,
    firstItem,
    initialActive,
} from "./cascade-select-context.ts";

export interface CascadeSelectTriggerState {
    open: boolean;
    disabled: boolean;
    placeholder: boolean;
}

// Within this time after a typed character, Space continues the typeahead instead of choosing.
const TYPEAHEAD_SPACE = 500;

/**
 * The select-only `combobox`: keeps DOM focus while open; the highlighted item of the deepest
 * open level is announced with `aria-activedescendant` (spec/cascade-select.md, "Keyboard").
 */
export function CascadeSelectTrigger(
    props: PartProps<CascadeSelectTriggerState>,
) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Trigger",
    );
    const direction = useContext(DirectionContext);
    const typeahead = useRef(createTypeahead()).current;
    const lastTyped = useRef(0);
    const { open, items, value, active, levels, disabled, changeOnSelect } =
        context;
    const depth = active.length - 1;
    const level = levels[depth] ?? [];
    const highlighted = active[depth];
    const index = level.findIndex((item) => item.value === highlighted);
    const current = level[index];
    const opening = () =>
        initialActive(items, value, cascadePathItems(items, value));

    const typeTo = (key: string, event: Event) => {
        lastTyped.current = Date.now();
        if (!open) {
            const match = typeahead.match(
                key,
                items.map((item) => item.label),
                items.findIndex((item) => item.value === value[0]),
            );
            const target = items[match]?.value;
            if (target !== undefined) {
                context.openOn([target], "list-navigation", event);
            }
            return;
        }
        const match = typeahead.match(
            key,
            level.map((item) => item.label),
            index,
        );
        const target = level[match]?.value;
        if (target !== undefined) {
            context.setActive([...active.slice(0, depth), target]);
        }
    };

    const highlightAt = (next: number) => {
        const target = level[next]?.value;
        if (target !== undefined) {
            context.setActive([...active.slice(0, depth), target]);
        }
    };
    const enterLevel = () => {
        if (current === undefined || current.disabled) {
            return false;
        }
        const first = firstItem(current.children ?? []);
        if (first === undefined) {
            return false;
        }
        context.setActive([...active, first]);
        return true;
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (disabled) {
            return;
        }
        const typing =
            event.key === " " &&
            Date.now() - lastTyped.current < TYPEAHEAD_SPACE;
        if (
            (event.key.length === 1 && event.key !== " ") ||
            (typing && event.key === " ")
        ) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            event.preventDefault();
            typeTo(event.key, event.nativeEvent);
            return;
        }
        if (!open) {
            switch (event.key) {
                case "ArrowDown":
                case "ArrowUp":
                case "Enter":
                case " ":
                    event.preventDefault();
                    context.openOn(
                        opening(),
                        "list-navigation",
                        event.nativeEvent,
                    );
                    return;
                case "Home":
                case "End": {
                    event.preventDefault();
                    const target = (
                        event.key === "Home" ? items[0] : items.at(-1)
                    )?.value;
                    context.openOn(
                        target === undefined ? [] : [target],
                        "list-navigation",
                        event.nativeEvent,
                    );
                    return;
                }
                default:
                    return;
            }
        }
        if (event.key === "Tab") {
            // APG: Tab chooses the highlighted option when it can be chosen, then focus moves on
            if (
                current !== undefined &&
                !current.disabled &&
                (changeOnSelect || !hasCascadeChildren(current))
            ) {
                context.choose(active, "focus-out", event.nativeEvent);
            } else {
                context.setOpen(false, "focus-out", event.nativeEvent);
            }
            return;
        }
        const rtl =
            context.trigger !== null &&
            getDirection(context.trigger, direction) === "rtl";
        const action = cascadeKeyAction(event, rtl);
        switch (action) {
            case "next":
                event.preventDefault();
                highlightAt(Math.min(index + 1, level.length - 1));
                return;
            case "previous":
                event.preventDefault();
                highlightAt(Math.max(index - 1, 0));
                return;
            case "first":
                event.preventDefault();
                highlightAt(0);
                return;
            case "last":
                event.preventDefault();
                highlightAt(level.length - 1);
                return;
            case "open-level":
                event.preventDefault();
                enterLevel();
                return;
            case "close-level":
                event.preventDefault();
                if (depth > 0) {
                    context.setActive(active.slice(0, -1));
                }
                return;
            case "choose": {
                event.preventDefault();
                if (current === undefined || current.disabled) {
                    return;
                }
                if (hasCascadeChildren(current)) {
                    if (changeOnSelect) {
                        context.choose(
                            active,
                            "item-press",
                            event.nativeEvent,
                            true,
                        );
                    }
                    enterLevel();
                    return;
                }
                context.choose(active, "item-press", event.nativeEvent);
                return;
            }
            default:
        }
    };

    const placeholder = value.length === 0;
    const state = { open, disabled, placeholder };
    return renderElement(
        "button",
        props,
        state,
        {
            type: "button",
            id: context.triggerId,
            role: "combobox",
            disabled,
            "aria-haspopup": "listbox",
            "aria-expanded": open ? "true" : "false",
            "aria-controls": open
                ? levels.map((_, at) => context.levelId(at)).join(" ")
                : undefined,
            "aria-activedescendant":
                open && highlighted !== undefined
                    ? context.itemId(depth, highlighted)
                    : undefined,
            "aria-required": context.required ? "true" : undefined,
            ...context.field.aria,
            "data-primitives-part": "cascade-select-trigger",
            ...context.field.attributes,
            ...stateAttributes({
                "popup-open": open,
                disabled,
                placeholder,
            }),
            onClick: (event: MouseEvent) => {
                if (open) {
                    context.setOpen(false, "trigger-press", event.nativeEvent);
                } else {
                    context.openOn(
                        opening(),
                        "trigger-press",
                        event.nativeEvent,
                    );
                }
            },
            onKeyDown,
            onFocus: context.field.onFocus,
            onBlur: context.field.onBlur,
        },
        context.setTrigger,
    );
}
