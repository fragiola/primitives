import {
    type AsyncListLoad,
    type AsyncListState,
    createAsyncList,
} from "@fragiola/primitives/async-list";
import { onBeforeUnmount, onMounted, shallowReactive } from "vue";

export interface UseAsyncListOptions<Item, Cursor> {
    /** Loads a page: `{ signal, filterText, cursor }` → `{ items, cursor? }`. */
    load: AsyncListLoad<Item, Cursor>;
    /** The first filter text (default `""`). */
    filterText?: string;
}

export interface AsyncListResult<Item> extends Readonly<AsyncListState<Item>> {
    /** `status` is `loading` or `loading-more`. */
    readonly loading: boolean;
    reload: () => void;
    loadMore: () => void;
    setFilterText: (text: string) => void;
}

/**
 * An async list in Vue state (spec/virtual-lists.md, "The mechanisms"): the toolkit's
 * `createAsyncList`, loading its first page once mounted and aborting the load in flight when
 * unmounted. A reactive object (`list.items`, `list.loading` in a template); the first render (on
 * a server too) is `loading`, with no items. Call it in a component's `setup`.
 */
export function useAsyncList<Item, Cursor = unknown>(
    options: UseAsyncListOptions<Item, Cursor>,
): AsyncListResult<Item> {
    const list = createAsyncList<Item, Cursor>({
        load: (request) => options.load(request),
        filterText: options.filterText,
        onChange: (next) => apply(next),
    });
    const result = shallowReactive({
        ...list.state(),
        status: "loading",
        loading: true,
        reload: list.reload,
        loadMore: list.loadMore,
        setFilterText: list.setFilterText,
    }) as AsyncListResult<Item>;
    const writable = result as {
        -readonly [Key in keyof AsyncListResult<Item>]: AsyncListResult<Item>[Key];
    };
    function apply(next: AsyncListState<Item>) {
        writable.items = next.items;
        writable.filterText = next.filterText;
        writable.status = next.status;
        writable.error = next.error;
        writable.hasMore = next.hasMore;
        writable.loading =
            next.status === "loading" || next.status === "loading-more";
    }
    onMounted(() => list.reload());
    onBeforeUnmount(() => list.abort());
    return result;
}
