import {
    afterNextRender,
    computed,
    DestroyRef,
    inject,
    PendingTasks,
    type Signal,
    signal,
} from "@angular/core";
import {
    type AsyncListLoad,
    type AsyncListState,
    type AsyncListStatus,
    createAsyncList,
} from "@fragiola/primitives/async-list";

export interface InjectAsyncListOptions<Item, Cursor> {
    /** Loads a page: `{ signal, filterText, cursor }` → `{ items, cursor? }`. */
    load: AsyncListLoad<Item, Cursor>;
    /** The first filter text (default `""`). */
    filterText?: string;
}

export interface AsyncListRef<Item> {
    items: Signal<readonly Item[]>;
    filterText: Signal<string>;
    status: Signal<AsyncListStatus>;
    error: Signal<unknown>;
    hasMore: Signal<boolean>;
    /** `status` is `loading` or `loading-more`. */
    loading: Signal<boolean>;
    /** Loads the first page again. */
    reload: () => void;
    /** Loads the next page (nothing while one loads, or when there is none). */
    loadMore: () => void;
    /** Loads the first page for the text. */
    setFilterText: (text: string) => void;
}

/**
 * An async list in signals (spec/virtual-lists.md, "The mechanisms"), in an injection context: the
 * toolkit's `createAsyncList`, loading its first page after the first render and aborting the
 * load in flight when destroyed. The first render (on a server too) is `loading`, with no items.
 * A load in flight is one of the application's pending tasks, as Angular's own async APIs: the
 * application is stable (`whenStable`) once its pages arrived.
 */
export function injectAsyncList<Item, Cursor = unknown>(
    options: InjectAsyncListOptions<Item, Cursor>,
): AsyncListRef<Item> {
    const tasks = inject(PendingTasks);
    let done: (() => void) | null = null;
    const list = createAsyncList<Item, Cursor>({
        load: options.load,
        filterText: options.filterText,
        onChange: (next) => {
            state.set(next);
            const loading =
                next.status === "loading" || next.status === "loading-more";
            if (loading && done === null) {
                done = tasks.add();
            } else if (!loading && done !== null) {
                done();
                done = null;
            }
        },
    });
    const state = signal<AsyncListState<Item>>({
        ...list.state(),
        status: "loading",
    });
    afterNextRender(() => list.reload());
    inject(DestroyRef).onDestroy(() => {
        list.abort();
        done?.();
        done = null;
    });
    const status = computed(() => state().status);
    return {
        items: computed(() => state().items),
        filterText: computed(() => state().filterText),
        status,
        error: computed(() => state().error),
        hasMore: computed(() => state().hasMore),
        loading: computed(
            () => status() === "loading" || status() === "loading-more",
        ),
        reload: list.reload,
        loadMore: list.loadMore,
        setFilterText: list.setFilterText,
    };
}
