// The items of the virtual list scenarios (spec/virtual-lists.md, "Scenarios").

export interface VirtualItem {
    value: string;
    label: string;
    disabled?: boolean;
}

/** 10 000 items: "Item <n>", but item 7777, "Zulu", and item 3, disabled. */
export const ITEMS: readonly VirtualItem[] = Array.from(
    { length: 10_000 },
    (_, index) => {
        const n = index + 1;
        return {
            value: `item-${n}`,
            label: n === 7777 ? "Zulu" : `Item ${n}`,
            ...(n === 3 ? { disabled: true } : {}),
        };
    },
);

/** The items' labels: the Autocomplete's suggestions. */
export const LABELS: readonly string[] = ITEMS.map((item) => item.label);

const PAGE = 50;

/**
 * The async loader: pages of 50 items whose label contains the text (case ignored), after 150 ms,
 * or 800 ms for the text `1` (a slow load a quicker one replaces). Rejects once aborted.
 */
export function loadItems({
    signal,
    filterText,
    cursor,
}: {
    signal: AbortSignal;
    filterText: string;
    cursor: number | undefined;
}): Promise<{ items: readonly VirtualItem[]; cursor: number | null }> {
    const query = filterText.trim().toLowerCase();
    const latency = query === "1" ? 800 : 150;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const matching = ITEMS.filter((item) =>
                item.label.toLowerCase().includes(query),
            );
            const from = cursor ?? 0;
            const to = from + PAGE;
            resolve({
                items: matching.slice(from, to),
                cursor: to < matching.length ? to : null,
            });
        }, latency);
        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("aborted", "AbortError"));
        });
    });
}

/** The loader over the labels (the Autocomplete's suggestions). */
export async function loadLabels(request: {
    signal: AbortSignal;
    filterText: string;
    cursor: number | undefined;
}): Promise<{ items: readonly string[]; cursor: number | null }> {
    const page = await loadItems(request);
    return { items: page.items.map((item) => item.label), cursor: page.cursor };
}
