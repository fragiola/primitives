import {
    cascadeKeyAction,
    cascadePathItems,
    hasCascadeChildren,
} from "@fragiola/primitives/cascade";
import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CascadeSelectKey,
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
export const CascadeSelectTrigger: PartComponent<
    Record<never, never>,
    CascadeSelectTriggerState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Trigger",
            );
            const setTrigger = elementSetter(context.trigger);
            const direction = useProvidedDirection();
            const typeahead = createTypeahead();
            let lastTyped = 0;

            const onKeydown = (event: KeyboardEvent) => {
                if (context.disabled()) {
                    return;
                }
                const items = context.items();
                const value = context.value.value;
                const open = context.open.value;
                const active = context.active.value;
                const depth = active.length - 1;
                const level = context.levels.value[depth] ?? [];
                const index = level.findIndex(
                    (item) => item.value === active[depth],
                );
                const current = level[index];
                const highlightAt = (next: number) => {
                    const target = level[next]?.value;
                    if (target !== undefined) {
                        context.setActive([...active.slice(0, depth), target]);
                    }
                };
                const enterLevel = () => {
                    if (current === undefined || current.disabled) {
                        return;
                    }
                    const first = firstItem(current.children ?? []);
                    if (first !== undefined) {
                        context.setActive([...active, first]);
                    }
                };

                const typing =
                    event.key === " " &&
                    Date.now() - lastTyped < TYPEAHEAD_SPACE;
                if ((event.key.length === 1 && event.key !== " ") || typing) {
                    if (event.ctrlKey || event.metaKey || event.altKey) {
                        return;
                    }
                    event.preventDefault();
                    lastTyped = Date.now();
                    if (!open) {
                        const match = typeahead.match(
                            event.key,
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
                        event.key,
                        level.map((item) => item.label),
                        index,
                    );
                    highlightAt(match);
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
                                initialActive(
                                    items,
                                    value,
                                    cascadePathItems(items, value),
                                ),
                                "list-navigation",
                                event,
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
                                event,
                            );
                            return;
                        }
                        default:
                            return;
                    }
                }
                if (event.key === "Tab") {
                    // APG: Tab chooses the highlighted option when it can be chosen, then focus
                    // moves on
                    if (
                        current !== undefined &&
                        !current.disabled &&
                        (context.changeOnSelect() ||
                            !hasCascadeChildren(current))
                    ) {
                        context.choose(active, "focus-out", event);
                    } else {
                        context.setOpen(false, "focus-out", event);
                    }
                    return;
                }
                const trigger = context.trigger.value;
                const rtl =
                    trigger !== null &&
                    getDirection(trigger, direction()) === "rtl";
                switch (cascadeKeyAction(event, rtl)) {
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
                    case "choose":
                        event.preventDefault();
                        if (current === undefined || current.disabled) {
                            return;
                        }
                        if (hasCascadeChildren(current)) {
                            if (context.changeOnSelect()) {
                                context.choose(
                                    active,
                                    "item-press",
                                    event,
                                    true,
                                );
                            }
                            enterLevel();
                            return;
                        }
                        context.choose(active, "item-press", event);
                        return;
                    default:
                }
            };

            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                const placeholder = context.value.value.length === 0;
                const active = context.active.value;
                const depth = active.length - 1;
                const highlighted = active[depth];
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open, disabled, placeholder },
                    {
                        type: "button",
                        id: context.triggerId,
                        role: "combobox",
                        disabled,
                        "aria-haspopup": "listbox",
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": open
                            ? context.levels.value
                                  .map((_, at) => context.levelId(at))
                                  .join(" ")
                            : undefined,
                        "aria-activedescendant":
                            open && highlighted !== undefined
                                ? context.itemId(depth, highlighted)
                                : undefined,
                        "aria-required": context.required()
                            ? "true"
                            : undefined,
                        ...context.field.aria(),
                        "data-primitives-part": "cascade-select-trigger",
                        ...context.field.attributes(),
                        ...stateAttributes({
                            "popup-open": open,
                            disabled,
                            placeholder,
                        }),
                        onClick: (event: MouseEvent) => {
                            if (context.open.value) {
                                context.setOpen(false, "trigger-press", event);
                            } else {
                                const items = context.items();
                                const value = context.value.value;
                                context.openOn(
                                    initialActive(
                                        items,
                                        value,
                                        cascadePathItems(items, value),
                                    ),
                                    "trigger-press",
                                    event,
                                );
                            }
                        },
                        onKeydown,
                        onFocus: context.field.onFocus,
                        onBlur: context.field.onBlur,
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
