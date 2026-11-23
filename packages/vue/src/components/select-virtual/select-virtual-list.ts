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
    useVirtualRows,
    type VirtualListEmits,
    type VirtualListProps,
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
import { type SelectItemData, SelectKey } from "../select/select-context.ts";
import { SelectList, type SelectListState } from "../select/select-list.ts";

export type SelectVirtualListProps = VirtualListProps;

/** The default scoped slot renders a `Select.Item` for each item of the Root's `items` in view. */
export interface SelectVirtualListSlots {
    default?: (scope: { item: SelectItemData; index: number }) => VNode[];
    render?: (scope: RenderSlotProps<SelectListState>) => VNode[];
}

/**
 * Select's List rendering only the Root's `items` in view (spec/virtual-lists.md): the
 * highlighted and selected items stay rendered, so `aria-activedescendant` names a rendered
 * option.
 */
export const SelectVirtualList: PublicComponent<
    SelectVirtualListProps & { as?: AsProp },
    SelectVirtualListSlots,
    VirtualListEmits
> = publicComponent(
    defineComponent({
        name: "SelectVirtualList",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...virtualListProps,
        },
        emits: {
            loadMore: () => true,
        },
        setup(props, { attrs, slots, emit }) {
            const context = useRequiredContext(SelectKey, "SelectVirtual.List");
            const list = shallowRef<HTMLElement | null>(null);
            const ref = chainedRef(elementSetter(list));
            const pinned = computed(() => {
                const highlighted = context.highlighted.value;
                const value = context.value.value;
                return context
                    .items()
                    .flatMap((item, index) =>
                        item.value === highlighted || item.value === value
                            ? [index]
                            : [],
                    );
            });
            const { rows, virtualizer } = useVirtualRows({
                items: context.items,
                pinned: () => pinned.value,
                list,
                props,
                onLoadMore: () => emit("loadMore"),
            });
            // the highlighted row in view, by its offset: after the Item's own scroll (its post
            // watcher runs in the same flush, again once the popup is placed), which reads boxes
            // a popup's opening scale transforms
            const active = computed(() =>
                context
                    .items()
                    .findIndex(
                        (item) => item.value === context.highlighted.value,
                    ),
            );
            const reveal = () => {
                const index = active.value;
                if (index >= 0) {
                    nextTick().then(() => virtualizer.scrollToIndex(index));
                }
            };
            onMounted(reveal);
            watch(() => [active.value, context.positioner.value], reveal, {
                flush: "post",
            });
            return () =>
                renderVirtualList(
                    SelectList,
                    { attrs, slots },
                    props.as,
                    props.loading,
                    rows(
                        slots.default &&
                            ((item, index) => slots.default?.({ item, index })),
                    ),
                    ref,
                );
        },
    }),
);
