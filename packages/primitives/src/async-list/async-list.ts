/**
 * Where an async list is: `loading` (the first page, or a new filter text), `loading-more` (the
 * next page), `error` (the last load failed), `idle`.
 */
export type AsyncListStatus = "idle" | "loading" | "loading-more" | "error";

export interface AsyncListState<Item> {
    items: readonly Item[];
    /** The text the items were asked for (sent to the loader). */
    filterText: string;
    status: AsyncListStatus;
    /** What the last failed load threw (`undefined` unless `status` is `error`). */
    error: unknown;
    /** Whether the loader gave a cursor for a next page. */
    hasMore: boolean;
}

/** What the loader is asked: its abort signal, the filter text and the next page's cursor. */
export interface AsyncListRequest<Cursor> {
    /** Aborted when a newer load replaces this one: a stale load's result is never used. */
    signal: AbortSignal;
    filterText: string;
    /** `undefined` for the first page, else the cursor the previous page gave. */
    cursor: Cursor | undefined;
}

/** A page of items, and the cursor of the next one (`null` or absent: no next page). */
export interface AsyncListPage<Item, Cursor> {
    items: readonly Item[];
    cursor?: Cursor | null;
}

export type AsyncListLoad<Item, Cursor> = (
    request: AsyncListRequest<Cursor>,
) => Promise<AsyncListPage<Item, Cursor>>;

export interface AsyncListOptions<Item, Cursor> {
    load: AsyncListLoad<Item, Cursor>;
    /** The first filter text (default `""`). */
    filterText?: string;
    /** The state changed. */
    onChange?: (state: AsyncListState<Item>) => void;
}

/**
 * An async list (spec/README.md, "Async lists"): loads the first page, the next pages and the
 * pages of a new filter text through the consumer's loader, aborting a stale load, and keeps the
 * items, the status and the error. Framework-free; a framework wraps it in its own state.
 */
export interface AsyncList<Item> {
    state(): AsyncListState<Item>;
    /** Loads the first page again (aborting a load in flight). */
    reload(): void;
    /** Loads the next page, unless one is loading or there is none. */
    loadMore(): void;
    /** Loads the first page for a new text (aborting a load in flight); the items stay until it arrives. */
    setFilterText(text: string): void;
    /** Aborts a load in flight (the list goes back to `idle`). */
    abort(): void;
}

export function createAsyncList<Item, Cursor = unknown>(
    options: AsyncListOptions<Item, Cursor>,
): AsyncList<Item> {
    let state: AsyncListState<Item> = {
        items: [],
        filterText: options.filterText ?? "",
        status: "idle",
        error: undefined,
        hasMore: false,
    };
    let cursor: Cursor | undefined;
    let controller: AbortController | null = null;

    const set = (next: Partial<AsyncListState<Item>>) => {
        state = { ...state, ...next };
        options.onChange?.(state);
    };
    const run = (more: boolean) => {
        controller?.abort();
        const own = new AbortController();
        controller = own;
        set({ status: more ? "loading-more" : "loading", error: undefined });
        let page: Promise<AsyncListPage<Item, Cursor>>;
        try {
            page = options.load({
                signal: own.signal,
                filterText: state.filterText,
                cursor: more ? cursor : undefined,
            });
        } catch (error) {
            page = Promise.reject(error);
        }
        page.then(
            (result) => {
                // a newer load replaced this one: its result is stale
                if (controller !== own || own.signal.aborted) {
                    return;
                }
                controller = null;
                cursor = result.cursor ?? undefined;
                set({
                    items: more
                        ? [...state.items, ...result.items]
                        : result.items,
                    status: "idle",
                    hasMore:
                        result.cursor !== undefined && result.cursor !== null,
                });
            },
            (error: unknown) => {
                if (controller !== own || own.signal.aborted) {
                    return;
                }
                controller = null;
                set({ status: "error", error });
            },
        );
    };

    return {
        state: () => state,
        reload: () => run(false),
        loadMore() {
            if (
                !state.hasMore ||
                state.status === "loading" ||
                state.status === "loading-more"
            ) {
                return;
            }
            run(true);
        },
        setFilterText(text) {
            state = { ...state, filterText: text };
            run(false);
        },
        abort() {
            if (controller === null) {
                return;
            }
            controller.abort();
            controller = null;
            set({ status: "idle" });
        },
    };
}
