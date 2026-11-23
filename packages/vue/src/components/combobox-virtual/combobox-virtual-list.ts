import {
    computed,
    defineComponent,
    nextTick,
    onMounted,
    shallowRef,
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
import { ComboboxKey } from "../combobox/combobox-context.ts";
import {
    ComboboxList,
    type ComboboxListState,
} from "../combobox/combobox-list.ts";

export type ComboboxVirtualListProps = VirtualListProps;

/**
 * The default scoped slot renders a `Combobox.Item` for each matching item in view (the Root's
 * `items`, flat). `entry` is the consumer's own type, named by the slot's annotation
 * (`v-slot="{ entry }: { entry: Country }"`), as `Combobox.List`'s: `never` until annotated.
 */
export interface ComboboxVirtualListSlots {
    default?: (scope: { entry: never; index: number }) => VNode[];
    render?: (scope: RenderSlotProps<ComboboxListState>) => VNode[];
}

/**
 * Combobox's List rendering only the matching items in view (spec/virtual-lists.md): the ends,
 * the highlighted item with its neighbours and the selected item stay rendered, so the Input's
 * keys and `aria-activedescendant` behave as with every item rendered.
 */
export const ComboboxVirtualList: PublicComponent<
    ComboboxVirtualListProps & { as?: AsProp },
    ComboboxVirtualListSlots,
    VirtualListEmits
> = publicComponent(
    defineComponent({
        name: "ComboboxVirtualList",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...virtualListProps,
        },
        emits: {
            loadMore: () => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(
                ComboboxKey,
                "ComboboxVirtual.List",
            );
            // the list element is Combobox.List's own (the context's `list`)
            const ref = chainedRef(elementSetter(context.list));
            const entries = () => context.entries.value;
            const selected = computed(() =>
                context.multiple()
                    ? -1
                    : entries().findIndex((entry) => context.isSelected(entry)),
            );
            const elements = shallowRef<ReadonlyMap<number, HTMLElement>>(
                new Map(),
            );
            // the highlighted option is rendered: its index is the one its element was rendered
            // at
            const current = computed<number | undefined>(() => {
                const highlighted = context.highlighted.value;
                if (highlighted === null) {
                    return undefined;
                }
                for (const [index, element] of elements.value) {
                    if (element.id === highlighted) {
                        return index;
                    }
                }
                return undefined;
            });
            const virtual: VirtualRows<unknown> = useVirtualRows({
                items: entries,
                pinned: () =>
                    reachableRows(
                        entries().length,
                        current.value,
                        selected.value,
                    ),
                list: context.list,
                props,
                onLoadMore: () => emit("loadMore"),
                elements,
            });
            // the highlighted row in view, by its offset: after the Item's own scroll (its post
            // watcher runs in the same flush, again once the popup is placed), which reads boxes
            // a popup's opening scale transforms
            const { virtualizer } = virtual;
            const reveal = () => {
                const index = current.value;
                if (index !== undefined) {
                    nextTick().then(() => virtualizer.scrollToIndex(index));
                }
            };
            onMounted(reveal);
            watch(() => [current.value, context.positioner.value], reveal, {
                flush: "post",
            });
            return () =>
                renderVirtualList(
                    ComboboxList,
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
