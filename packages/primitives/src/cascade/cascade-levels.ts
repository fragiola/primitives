// A cascading select's tree, its open levels and its chosen path (spec/cascade-select.md). Pure.

/** One entry of a cascading select's tree: a parent when it has children, else a leaf. */
export interface CascadeItem {
    value: string;
    label: string;
    disabled?: boolean;
    children?: readonly CascadeItem[];
}

/** Whether an item is a parent: it has at least one child. */
export function hasCascadeChildren(item: CascadeItem | undefined): boolean {
    return (item?.children?.length ?? 0) > 0;
}

/**
 * The items of each open level for a chain of values from the first level down: the first
 * level's items, then the children of each value of `chain` that is a parent, stopping at the
 * first value that is missing or a leaf.
 */
export function cascadeLevels(
    items: readonly CascadeItem[],
    chain: readonly string[],
): (readonly CascadeItem[])[] {
    const levels: (readonly CascadeItem[])[] = [items];
    let current = items;
    for (const value of chain) {
        const item = current.find((candidate) => candidate.value === value);
        if (item === undefined || !hasCascadeChildren(item)) {
            break;
        }
        current = item.children ?? [];
        levels.push(current);
    }
    return levels;
}

/**
 * The items a path names, from the first level down; `null` when a value is not among its
 * level's items (the path does not exist in the tree).
 */
export function cascadePathItems(
    items: readonly CascadeItem[],
    path: readonly string[],
): CascadeItem[] | null {
    const found: CascadeItem[] = [];
    let current: readonly CascadeItem[] = items;
    for (const value of path) {
        const item = current.find((candidate) => candidate.value === value);
        if (item === undefined) {
            return null;
        }
        found.push(item);
        current = item.children ?? [];
    }
    return found;
}
