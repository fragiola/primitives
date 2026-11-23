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
import {
    AutocompleteKey,
    isEmpty,
    orderedItems,
} from "./autocomplete-context.ts";

export interface AutocompleteListState {
    empty: boolean;
}

/**
 * With the Root's `items`, the default slot renders each matching entry (a suggestion, or a group
 * whose `items` are its matching suggestions); without them, it renders once with the state.
 * `entry` is the consumer's own type, named by the slot's annotation
 * (`v-slot="{ entry }: { entry: Fruit }"`): `never` until annotated, so any annotation binds.
 */
export interface AutocompleteListSlots {
    default?: (scope: {
        entry: never;
        index: number;
        state: AutocompleteListState;
    }) => VNode[];
    render?: (scope: RenderSlotProps<AutocompleteListState>) => VNode[];
}

/**
 * The `listbox`. Applies the highlight the keyboard or the typing asked for once its suggestions
 * render, and drops a highlight whose suggestion is gone (new `items`).
 */
export const AutocompleteList: PublicComponent<
    { as?: AsProp },
    AutocompleteListSlots
> = publicComponent(
    defineComponent({
        name: "AutocompleteList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.List",
            );
            const setList = elementSetter(context.list);
            watch(
                () =>
                    [
                        context.list.value,
                        context.itemCount.value,
                        context.open.value,
                        context.pendingTick.value,
                        context.entries.value,
                    ] as const,
                ([list, , open]) => {
                    if (list === null) {
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
                    const asked = context.pending.current;
                    if (asked !== null && open) {
                        context.pending.current = null;
                        if (asked === "complete") {
                            const typed = context.value.value.toLowerCase();
                            const match = items.find(
                                (item) =>
                                    !item.disabled &&
                                    context
                                        .label(item.value)
                                        .toLowerCase()
                                        .startsWith(typed),
                            );
                            if (match !== undefined) {
                                context.complete(match);
                            }
                            return;
                        }
                        const target =
                            asked === "first" ? items[0] : items.at(-1);
                        context.highlight(target?.id ?? null, "keyboard");
                        return;
                    }
                    const id = context.highlighted.value;
                    if (id !== null && !items.some((item) => item.id === id)) {
                        context.highlight(null, "keyboard");
                    }
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
                        "data-primitives-part": "autocomplete-list",
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
