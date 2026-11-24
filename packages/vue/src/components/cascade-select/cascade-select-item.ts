import { hasCascadeChildren } from "@fragiola/primitives/cascade";
import { scrollIntoViewWithin } from "@fragiola/primitives/collection";
import { isInSafeArea } from "@fragiola/primitives/pointer";
import { computed, defineComponent, provide, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CascadeSelectItemKey,
    type CascadeSelectItemState,
    CascadeSelectKey,
    CascadeSelectLevelKey,
    samePath,
} from "./cascade-select-context.ts";

export interface CascadeSelectItemProps {
    /** The entry's `value` among its Level's items. */
    value: string;
}

// Menu's SubmenuTrigger default (spec/menu.md): the hover time before a parent opens its level.
const HOVER_DELAY = 100;

/** An `option`: a parent opens its level, a leaf is chosen (spec/cascade-select.md). */
export const CascadeSelectItem: PartComponent<
    CascadeSelectItemProps,
    CascadeSelectItemState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            /** The entry's `value` among its Level's items. */
            value: { type: String, required: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Item",
            );
            const level = useRequiredContext(
                CascadeSelectLevelKey,
                "CascadeSelect.Item",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // the pointer's last position over the item: where a jump left it (a leave event
            // carries the new position, already over the next item)
            let lastPoint: { x: number; y: number } | null = null;
            const entry = () =>
                level.items().find((item) => item.value === props.value);
            const path = () => [
                ...context.active.value.slice(0, level.depth()),
                props.value,
            ];
            const state = computed<CascadeSelectItemState>(() => {
                const depth = level.depth();
                const active = context.active.value;
                const hasChildren = hasCascadeChildren(entry());
                return {
                    highlighted:
                        active.length - 1 === depth &&
                        active[depth] === props.value,
                    selected: samePath(
                        context.value.value.slice(0, depth + 1),
                        [...active.slice(0, depth), props.value],
                    ),
                    disabled: entry()?.disabled ?? false,
                    hasChildren,
                    expanded:
                        hasChildren &&
                        active[depth] === props.value &&
                        depth + 1 < context.levels.value.length,
                };
            });
            provide(CascadeSelectItemKey, state);
            watch(
                () =>
                    [
                        state.value.highlighted,
                        element.value,
                        context.positioner.value,
                    ] as const,
                ([highlighted]) => {
                    if (highlighted && element.value) {
                        scrollIntoViewWithin(
                            element.value,
                            context.positioner.value,
                        );
                    }
                },
                { flush: "post", immediate: true },
            );

            const stopHover = () => {
                clearTimeout(context.hoverTimer.current);
                context.hoverTimer.current = undefined;
            };
            const startHover = () => {
                stopHover();
                if (!state.value.hasChildren || state.value.disabled) {
                    return;
                }
                const target = path();
                context.hoverTimer.current = setTimeout(() => {
                    context.hoverTimer.current = undefined;
                    context.setActive(target, true);
                }, HOVER_DELAY);
            };
            const onPointermove = (event: PointerEvent) => {
                lastPoint = { x: event.clientX, y: event.clientY };
                const depth = level.depth();
                const active = context.active.value;
                // the safe area: the pointer travels from an open parent of this level to its
                // level
                const area = context.safeArea.current;
                const levelElement =
                    area === null
                        ? null
                        : element.value?.ownerDocument.getElementById(
                              context.levelId(area.depth),
                          );
                if (
                    area !== null &&
                    levelElement &&
                    !levelElement.hidden &&
                    area.depth === depth + 1 &&
                    active[depth] !== props.value &&
                    isInSafeArea(
                        { x: event.clientX, y: event.clientY },
                        area,
                        levelElement,
                    )
                ) {
                    return;
                }
                if (state.value.highlighted) {
                    if (
                        !context.peek.value &&
                        context.hoverTimer.current === undefined
                    ) {
                        startHover();
                    }
                    return;
                }
                if (active[depth] === props.value && state.value.expanded) {
                    // back on the open parent: its level stays open
                    context.setActive(path(), true);
                    return;
                }
                context.setActive(path());
                startHover();
            };

            return () => {
                const depth = level.depth();
                const {
                    highlighted,
                    selected,
                    disabled,
                    hasChildren,
                    expanded,
                } = state.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        role: "option",
                        id: context.itemId(depth, props.value),
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
                        onPointermove,
                        onPointerleave: (event: PointerEvent) => {
                            stopHover();
                            const from = lastPoint ?? {
                                x: event.clientX,
                                y: event.clientY,
                            };
                            lastPoint = null;
                            if (state.value.expanded) {
                                context.safeArea.current = {
                                    ...from,
                                    depth: level.depth() + 1,
                                };
                            }
                        },
                        // the trigger keeps DOM focus
                        onPointerdown: (event: PointerEvent) =>
                            event.preventDefault(),
                        onClick: (event: MouseEvent) => {
                            if (state.value.disabled) {
                                return;
                            }
                            stopHover();
                            if (state.value.hasChildren) {
                                if (context.changeOnSelect()) {
                                    context.choose(
                                        path(),
                                        "item-press",
                                        event,
                                        true,
                                    );
                                }
                                context.setActive(path(), true);
                                return;
                            }
                            context.choose(path(), "item-press", event);
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
