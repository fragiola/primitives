/** How urgently a toast is announced: `low` politely, `high` assertively (spec/toast.md). */
export type ToastPriority = "low" | "high";

/** What a toast says and how long it stays (spec/toast.md, "The toast queue"). */
export interface ToastOptions<Data = unknown> {
    /** Adding a toast with the id of an open one updates it in place and restarts its timer. */
    id?: string;
    title?: string;
    description?: string;
    /** Free-form (`success`, `error`, ...); `loading` never closes by itself. */
    type?: string;
    /** ms before it closes by itself (default: the manager's); `0`: never. */
    timeout?: number;
    /** `low` (default): announced politely; `high`: assertively. */
    priority?: ToastPriority;
    /** The app's own data, for its rendering. */
    data?: Data;
    /** Called once when it closes (by its timer, a Close, a swipe, Escape or `close`). */
    onClose?: () => void;
    /** Called once it left the list, after its exit animation. */
    onRemove?: () => void;
}

/** A change to an open toast (`update`): any option but its id. */
export type ToastUpdate<Data = unknown> = Omit<ToastOptions<Data>, "id">;

/** A toast in the queue: its options, and what the queue derives for its rendering. */
export interface ToastObject<Data = unknown> extends ToastUpdate<Data> {
    readonly id: string;
    readonly priority: ToastPriority;
    /** Closed: its exit runs until the component calls `remove(id)`. */
    readonly closing: boolean;
    /** Past the `limit`: queued behind the newer ones, its timer waiting (spec/toast.md). */
    readonly limited: boolean;
    /** Its place in the stack, `0` the frontmost (newest); a closing toast keeps its list index. */
    readonly index: number;
    /** Its measured height in px (`setHeight`), `0` until measured and once closing. */
    readonly height: number;
    /** The sum of the heights of the toasts in front of it, in px. */
    readonly offsetY: number;
    /** Counts its updates (an upsert, `update`), so a component knows to measure it again. */
    readonly updateKey: number;
}

/** A promise toast's three states: each a title, options, or a function of the result. */
export interface ToastPromiseOptions<Value, Data = unknown> {
    loading: string | ToastOptions<Data>;
    success:
        | string
        | ToastUpdate<Data>
        | ((value: Value) => string | ToastUpdate<Data>);
    error:
        | string
        | ToastUpdate<Data>
        | ((error: unknown) => string | ToastUpdate<Data>);
}

export interface ToastManagerOptions {
    /** How many toasts show at once; the older ones wait (default `3`). */
    limit?: number;
    /** The default ms before a toast closes by itself (default `5000`; `0`: never). */
    timeout?: number;
}

/**
 * The toast queue (spec/toast.md, "The toast queue"): the app's notifications, which a plain
 * module can import and fill, with no component. Toast's Provider renders from it and reports
 * back what only the page knows (heights, the end of an exit, the hover and focus that pause it).
 */
export interface ToastManager<Data = unknown> {
    /** The toasts, newest first: the same array until something changes. */
    toasts(): readonly ToastObject<Data>[];
    /** Calls `listener` after every change; returns the unsubscribe. */
    subscribe(listener: () => void): () => void;
    /** Adds a toast (or updates the open one with its id); returns its id. */
    add(options: ToastOptions<Data>): string;
    /** Changes an open toast; ignored for a closing or unknown one. */
    update(
        id: string,
        updates:
            | ToastUpdate<Data>
            | ((toast: ToastObject<Data>) => ToastUpdate<Data>),
    ): void;
    /** Closes a toast, or every toast without an id. */
    close(id?: string): void;
    /**
     * A `loading` toast that becomes `success` or `error` when `promise` settles; returns the
     * promise's own result (rejected with its error).
     */
    promise<Value>(
        promise: Promise<Value>,
        options: ToastPromiseOptions<Value, Data>,
    ): Promise<Value>;
    /** Takes a closed toast out of the list once its exit ended (the component calls it). */
    remove(id: string): void;
    /** Records a toast's measured height (the stacking offsets). */
    setHeight(id: string, height: number): void;
    /** Pauses every timer for `source` (`hover`, `focus`, `hidden`, ...) until resumed. */
    pause(source: string): void;
    /** Ends `source`'s pause; the timers run again once no source pauses them. */
    resume(source: string): void;
    /** Changes the limit or the default timeout (a Provider's props). */
    configure(options: ToastManagerOptions): void;
}

interface Entry<Data> {
    options: ToastUpdate<Data>;
    id: string;
    closing: boolean;
    height: number;
    updateKey: number;
    /** ms its timer has left, `null` for none (loading, `timeout: 0`). */
    remaining: number | null;
    /** When its timer last started running, while it runs. */
    startedAt: number | null;
    handle: ReturnType<typeof setTimeout> | undefined;
}

function toOptions<Data>(value: string | ToastUpdate<Data>): ToastUpdate<Data> {
    return typeof value === "string" ? { title: value } : value;
}

/**
 * Creates a toast queue (spec/toast.md, "The toast queue"). Its timers run on the page's clock
 * (`setTimeout`, `Date.now`); a toast's timer runs only while it shows (not queued past the
 * limit, not closing, not `loading`) and nothing pauses the queue, and keeps what it had left
 * across pauses.
 */
export function createToastManager<Data = unknown>(
    options: ToastManagerOptions = {},
): ToastManager<Data> {
    let limit = options.limit ?? 3;
    let timeout = options.timeout ?? 5000;
    let entries: Entry<Data>[] = [];
    let snapshot: readonly ToastObject<Data>[] = [];
    let count = 0;
    const pauses = new Set<string>();
    const listeners = new Set<() => void>();

    const duration = (entry: Entry<Data>): number | null => {
        const value = entry.options.timeout ?? timeout;
        return entry.options.type === "loading" || value <= 0 ? null : value;
    };

    const limitedIds = (): Set<string> => {
        const limited = new Set<string>();
        let shown = 0;
        for (const entry of entries) {
            if (entry.closing) {
                continue;
            }
            if (shown >= limit) {
                limited.add(entry.id);
            }
            shown += 1;
        }
        return limited;
    };

    const stop = (entry: Entry<Data>) => {
        if (entry.handle !== undefined) {
            clearTimeout(entry.handle);
            entry.handle = undefined;
        }
        if (entry.startedAt !== null && entry.remaining !== null) {
            entry.remaining = Math.max(
                0,
                entry.remaining - (Date.now() - entry.startedAt),
            );
        }
        entry.startedAt = null;
    };

    // starts or stops every timer for the current state
    const syncTimers = (limited: Set<string>) => {
        for (const entry of entries) {
            const runs =
                !entry.closing &&
                entry.remaining !== null &&
                pauses.size === 0 &&
                !limited.has(entry.id);
            if (!runs) {
                stop(entry);
            } else if (entry.handle === undefined) {
                const left = entry.remaining as number;
                entry.startedAt = Date.now();
                entry.handle = setTimeout(() => {
                    entry.handle = undefined;
                    entry.startedAt = null;
                    entry.remaining = 0;
                    close(entry.id);
                }, left);
            }
        }
    };

    const commit = () => {
        const limited = limitedIds();
        syncTimers(limited);
        let shown = 0;
        let offsetY = 0;
        snapshot = entries.map((entry, position) => {
            const toast: ToastObject<Data> = {
                ...entry.options,
                id: entry.id,
                priority: entry.options.priority ?? "low",
                closing: entry.closing,
                limited: limited.has(entry.id),
                index: entry.closing ? position : shown,
                height: entry.height,
                offsetY,
                updateKey: entry.updateKey,
            };
            offsetY += entry.height;
            if (!entry.closing) {
                shown += 1;
            }
            return toast;
        });
        for (const listener of [...listeners]) {
            listener();
        }
    };

    const find = (id: string) => entries.find((entry) => entry.id === id);

    const restart = (entry: Entry<Data>) => {
        stop(entry);
        entry.remaining = duration(entry);
    };

    function close(id?: string) {
        const closing = entries.filter(
            (entry) => !entry.closing && (id === undefined || entry.id === id),
        );
        if (closing.length === 0) {
            return;
        }
        for (const entry of closing) {
            stop(entry);
            entry.closing = true;
            entry.height = 0;
        }
        commit();
        for (const entry of closing) {
            entry.options.onClose?.();
        }
    }

    function add(toast: ToastOptions<Data>): string {
        const { id: requested, ...rest } = toast;
        const existing = requested === undefined ? undefined : find(requested);
        if (existing !== undefined && !existing.closing) {
            existing.options = { ...existing.options, ...rest };
            existing.updateKey += 1;
            restart(existing);
            commit();
            return existing.id;
        }
        if (existing !== undefined) {
            // a closing toast with that id leaves at once, without its onRemove
            stop(existing);
            entries = entries.filter((entry) => entry !== existing);
        }
        count += 1;
        const entry: Entry<Data> = {
            options: rest,
            id: requested ?? `toast-${count}`,
            closing: false,
            height: 0,
            updateKey: 0,
            remaining: null,
            startedAt: null,
            handle: undefined,
        };
        entry.remaining = duration(entry);
        entries = [entry, ...entries];
        commit();
        return entry.id;
    }

    function update(
        id: string,
        updates:
            | ToastUpdate<Data>
            | ((toast: ToastObject<Data>) => ToastUpdate<Data>),
    ) {
        const entry = find(id);
        const current = snapshot.find((toast) => toast.id === id);
        if (entry === undefined || entry.closing || current === undefined) {
            return;
        }
        const next = typeof updates === "function" ? updates(current) : updates;
        // the updater may have closed it
        if (entry.closing) {
            return;
        }
        const wasLoading = entry.options.type === "loading";
        entry.options = { ...entry.options, ...next };
        entry.updateKey += 1;
        if (
            wasLoading ||
            Object.hasOwn(next, "timeout") ||
            Object.hasOwn(next, "type")
        ) {
            restart(entry);
        }
        commit();
    }

    return {
        toasts: () => snapshot,
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        add,
        update,
        close,
        promise(promise, settled) {
            const id = add({ ...toOptions(settled.loading), type: "loading" });
            return promise.then(
                (value) => {
                    const success =
                        typeof settled.success === "function"
                            ? settled.success(value)
                            : settled.success;
                    update(id, { type: "success", ...toOptions(success) });
                    return value;
                },
                (error: unknown) => {
                    const failure =
                        typeof settled.error === "function"
                            ? settled.error(error)
                            : settled.error;
                    update(id, { type: "error", ...toOptions(failure) });
                    throw error;
                },
            );
        },
        remove(id) {
            const entry = find(id);
            if (entry === undefined || !entry.closing) {
                return;
            }
            entries = entries.filter((other) => other !== entry);
            commit();
            entry.options.onRemove?.();
        },
        setHeight(id, height) {
            const entry = find(id);
            if (
                entry === undefined ||
                entry.closing ||
                entry.height === height
            ) {
                return;
            }
            entry.height = height;
            commit();
        },
        pause(source) {
            if (pauses.has(source)) {
                return;
            }
            pauses.add(source);
            syncTimers(limitedIds());
        },
        resume(source) {
            if (!pauses.delete(source)) {
                return;
            }
            syncTimers(limitedIds());
        },
        configure(next) {
            const changed =
                (next.limit !== undefined && next.limit !== limit) ||
                (next.timeout !== undefined && next.timeout !== timeout);
            limit = next.limit ?? limit;
            timeout = next.timeout ?? timeout;
            if (changed) {
                commit();
            }
        },
    };
}
