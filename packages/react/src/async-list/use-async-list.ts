import {
    type AsyncListLoad,
    type AsyncListState,
    createAsyncList,
} from "@fragiola/primitives/async-list";
import { useEffect, useRef, useState } from "react";

export interface UseAsyncListOptions<Item, Cursor> {
    /** Loads a page: `{ signal, filterText, cursor }` → `{ items, cursor? }`. */
    load: AsyncListLoad<Item, Cursor>;
    /** The first filter text (default `""`). */
    filterText?: string;
}

export interface AsyncListResult<Item> extends AsyncListState<Item> {
    /** `status` is `loading` or `loading-more`. */
    loading: boolean;
    reload: () => void;
    loadMore: () => void;
    setFilterText: (text: string) => void;
}

/**
 * An async list in React state (spec/virtual-lists.md, "The mechanisms"): the toolkit's
 * `createAsyncList`, loading its first page once mounted and aborting the load in flight when
 * unmounted. The first render (on a server too) is `loading`, with no items.
 */
export function useAsyncList<Item, Cursor = unknown>(
    options: UseAsyncListOptions<Item, Cursor>,
): AsyncListResult<Item> {
    const loader = useRef(options.load);
    loader.current = options.load;
    const [list] = useState(() =>
        createAsyncList<Item, Cursor>({
            load: (request) => loader.current(request),
            filterText: options.filterText,
            onChange: (next) => setState(next),
        }),
    );
    const [state, setState] = useState<AsyncListState<Item>>(() => ({
        ...list.state(),
        status: "loading",
    }));
    useEffect(() => {
        list.reload();
        return () => list.abort();
    }, [list]);
    return {
        ...state,
        loading: state.status === "loading" || state.status === "loading-more",
        reload: list.reload,
        loadMore: list.loadMore,
        setFilterText: list.setFilterText,
    };
}
