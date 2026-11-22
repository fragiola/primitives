import type { VNode } from "vue";
import { defineComponent, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { AsProp, RenderSlotProps } from "../../utils/render-part.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ComboboxKey, isEmpty, orderedItems } from "./combobox-context.ts";

export interface ComboboxListState {
    empty: boolean;
}

/**
 * With the Root's `items`, the default slot renders each matching entry (an item, or a group whose
 * `items` are its matching items); without them, it renders once with the state.
 */
export interface ComboboxListSlots {
    default?: (scope: {
        entry: unknown;
        index: number;
        state: ComboboxListState;
    }) => VNode[];
    render?: (scope: RenderSlotProps<ComboboxListState>) => VNode[];
}

/**
 * The `listbox`. With the Root's `items`, its default scoped slot renders each matching entry
 * (`v-slot="{ entry, index }"`: an item, or a group); without them, its content as is. Applies
 * the highlight the keyboard asked for once its items render.
 */
export const ComboboxList: PublicComponent<{ as?: AsProp }, ComboboxListSlots> =
    publicComponent(
        defineComponent({
            name: "ComboboxList",
            inheritAttrs: false,
            props: asProp,
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    ComboboxKey,
                    "Combobox.List",
                );
                const setList = elementSetter(context.list);
                watch(
                    // runs when the list opens (a list reopened while it closes keeps its element), or its
                    // items change
                    () =>
                        [
                            context.list.value,
                            context.itemCount.value,
                            context.open.value,
                        ] as const,
                    ([list]) => {
                        const pending = context.pendingHighlight.current;
                        if (list === null || pending === null) {
                            return;
                        }
                        const items = orderedItems(context);
                        // the items register after the list renders them: wait for every one
                        if (
                            items.length <
                            list.querySelectorAll('[role="option"]').length
                        ) {
                            return;
                        }
                        context.pendingHighlight.current = null;
                        const selected = context.multiple()
                            ? undefined
                            : items.find((item) =>
                                  context.isSelected(item.value),
                              );
                        const edge =
                            pending === "first" ? items[0] : items.at(-1);
                        const target =
                            selected ??
                            (pending === "selected" ? undefined : edge);
                        context.highlighted.value = target?.id ?? null;
                    },
                    { flush: "post", immediate: true },
                );
                return () => {
                    const empty = isEmpty(context);
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        { empty },
                        {
                            role: "listbox",
                            id: context.listId,
                            "aria-multiselectable": context.multiple()
                                ? "true"
                                : undefined,
                            "data-primitives-part": "combobox-list",
                            ...stateAttributes({ empty }),
                            ref: setList,
                        },
                        () =>
                            context.hasItems()
                                ? context.entries.value.flatMap(
                                      (entry, index) =>
                                          slots.default?.({
                                              entry,
                                              index,
                                              state: { empty },
                                          }) ?? [],
                                  )
                                : slots.default?.({ state: { empty } }),
                    );
                };
            },
        }),
    );
