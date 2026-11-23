import {
    clampPage,
    type PaginationItem,
    pageCount,
    paginationRange,
} from "@fragiola/primitives/pagination";
import {
    computed,
    defineComponent,
    provide,
    type SlotsType,
    type VNode,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PaginationKey, type PaginationState } from "./pagination-context.ts";

/** What the Root's default scoped slot receives. */
export interface PaginationSlotProps {
    /** The range, in order: pages and ellipses. */
    items: PaginationItem[];
    page: number;
    count: number;
}

export interface PaginationRootSlots {
    default?: (scope: PaginationSlotProps) => VNode[];
    render?: (scope: RenderSlotProps<PaginationState>) => VNode[];
}

export interface PaginationRootProps {
    as?: AsProp;
    /** The current page, from 1 (`v-model:page`). */
    page?: number;
    /** The page at first (default `1`). */
    defaultPage?: number;
    /** The number of pages; or `total` and `pageSize`. */
    count?: number;
    /** The number of rows, with `pageSize`, when `count` is not given. */
    total?: number;
    /** The rows per page (default `10`). */
    pageSize?: number;
    /** The pages shown on each side of the current one (default `1`). */
    siblingCount?: number;
    /** The pages always shown at each end (default `1`). */
    boundaryCount?: number;
    /** Every control is disabled. */
    disabled?: boolean;
}

export type PaginationRootEmits = {
    /** The new page (`v-model:page`). */
    "update:page": (page: number) => true;
    /** Every page change, with its reason. */
    pageChange: (page: number, details: ChangeDetails) => true;
};

/**
 * The `nav` landmark of a paged list (spec/pagination.md): it holds the page and the range its
 * default scoped slot renders as Items and Ellipses. The app names it (`aria-label`).
 */
export const PaginationRoot: PublicComponent<
    PaginationRootProps,
    PaginationRootSlots,
    PaginationRootEmits
> = publicComponent(
    defineComponent({
        name: "PaginationRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            page: { type: Number, default: undefined },
            defaultPage: { type: Number, default: 1 },
            count: { type: Number, default: undefined },
            total: { type: Number, default: undefined },
            pageSize: { type: Number, default: undefined },
            siblingCount: { type: Number, default: undefined },
            boundaryCount: { type: Number, default: undefined },
            disabled: { type: Boolean, default: false },
        },
        emits: {
            "update:page": (_page: number) => true,
            pageChange: (_page: number, _details: ChangeDetails) => true,
        },
        slots: Object as SlotsType<PaginationRootSlots>,
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<number, ChangeDetails>(
                () => props.page,
                props.defaultPage,
                (next, details) => {
                    emit("update:page", next);
                    emit("pageChange", next, details);
                },
            );
            const count = computed(() =>
                pageCount({
                    count: props.count,
                    total: props.total,
                    pageSize: props.pageSize,
                }),
            );
            const page = computed(() =>
                clampPage(own.value.value, count.value),
            );
            const items = computed(() =>
                paginationRange({
                    page: page.value,
                    count: count.value,
                    siblingCount: props.siblingCount,
                    boundaryCount: props.boundaryCount,
                }),
            );
            const state = (): PaginationState => ({
                page: page.value,
                count: count.value,
                disabled: props.disabled,
            });
            provide(PaginationKey, {
                state,
                setPage: (next, details) => {
                    const target = clampPage(next, count.value);
                    if (target !== page.value) {
                        own.set(target, details);
                    }
                },
            });
            return () =>
                renderPart(
                    "nav",
                    { attrs, slots },
                    props.as,
                    state(),
                    {
                        "data-primitives-part": "pagination-root",
                        ...stateAttributes({ disabled: props.disabled }),
                    },
                    () =>
                        slots.default?.({
                            items: items.value,
                            page: page.value,
                            count: count.value,
                        }),
                );
        },
    }),
);
