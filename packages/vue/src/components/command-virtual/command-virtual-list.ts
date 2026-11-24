import {
    bestMatch,
    type CommandEntry,
    commandMatches,
} from "@fragiola/primitives/command";
import {
    computed,
    defineComponent,
    nextTick,
    onMounted,
    type PropType,
    type VNode,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    reachableRows,
    useVirtualRows,
    type VirtualListEmits,
    type VirtualListProps,
    type VirtualRows,
    virtualListProps,
} from "../../composables/use-virtual-rows.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
} from "../../utils/render-part.ts";
import { chainedRef, renderVirtualList } from "../../utils/virtual-list.ts";
import { CommandKey } from "../command/command-context.ts";
import { CommandList, type CommandListState } from "../command/command-list.ts";

export interface CommandVirtualListProps extends VirtualListProps {
    /** The entries: the List filters them with the Root's text and `filter`. */
    items: readonly CommandEntry[];
}

/**
 * The default scoped slot renders a `Command.Item` for each matching entry in view. `entry` is
 * the consumer's own type, named by the slot's annotation (`v-slot="{ entry }: { entry: Action
 * }"`): `never` until annotated, so any annotation binds.
 */
export interface CommandVirtualListSlots {
    default?: (scope: { entry: never; index: number }) => VNode[];
    render?: (scope: RenderSlotProps<CommandListState>) => VNode[];
}

/**
 * Command's List rendering only the matching Items in view (spec/command.md, "Virtual list"):
 * the ends, the highlighted Item with its neighbours and the best match stay rendered, so the
 * Input's keys and the highlight behave as with every Item rendered.
 */
export const CommandVirtualList: PublicComponent<
    CommandVirtualListProps & { as?: AsProp },
    CommandVirtualListSlots,
    VirtualListEmits
> = publicComponent(
    defineComponent({
        name: "CommandVirtualList",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...virtualListProps,
            items: {
                type: Array as PropType<readonly CommandEntry[]>,
                required: true,
            },
        },
        emits: {
            loadMore: () => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(
                CommandKey,
                "CommandVirtual.List",
            );
            // the list element is Command.List's own (the context's `list`)
            const ref = chainedRef(elementSetter(context.list));
            const matches = computed(() =>
                commandMatches(
                    props.items,
                    context.search.value,
                    context.filter(),
                ),
            );
            const entries = () => matches.value.entries;
            const best = computed(() =>
                bestMatch(
                    matches.value.scores,
                    (index) => entries()[index]?.disabled === true,
                ),
            );
            const current = computed<number | undefined>(() => {
                const found = entries().findIndex(
                    (entry) => entry.value === context.highlighted.value,
                );
                return found === -1 ? undefined : found;
            });
            const virtual: VirtualRows<CommandEntry> = useVirtualRows({
                items: entries,
                pinned: () =>
                    reachableRows(entries().length, current.value, best.value),
                list: context.list,
                props,
                onLoadMore: () => emit("loadMore"),
            });
            // the highlighted row in view, by its offset (the Item scrolls only within what is
            // rendered)
            const { virtualizer } = virtual;
            const reveal = () => {
                const index = current.value;
                if (index !== undefined) {
                    nextTick().then(() => virtualizer.scrollToIndex(index));
                }
            };
            onMounted(reveal);
            watch(current, reveal, { flush: "post" });
            return () =>
                renderVirtualList(
                    CommandList,
                    { attrs, slots },
                    props.as,
                    props.loading,
                    virtual.rows(
                        slots.default &&
                            ((entry, index) =>
                                slots.default?.({
                                    entry: entry as never,
                                    index,
                                })),
                    ),
                    ref,
                );
        },
    }),
);
