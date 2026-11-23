/** One option of a list collection (spec/listbox.md, "The collections mechanism"). */
export interface ListNode {
    /** The option's key: its value. */
    key: string;
    /** The text typeahead matches. */
    textValue: string;
    /** Takes focus, never the selection. */
    disabled?: boolean;
}

/**
 * The options of a list in order, with their indexes (spec/listbox.md): what the selection rules
 * and the key map read. Built from what a framework registered, in document order.
 */
export interface ListModel {
    readonly nodes: readonly ListNode[];
    readonly size: number;
    /** The index of `key`, or -1. */
    indexOf(key: string | null): number;
    /** Whether `key` names a disabled option (an unknown key is not disabled). */
    isDisabled(key: string): boolean;
    /** The keys of the enabled options, in order. */
    readonly enabledKeys: readonly string[];
    /** The labels, in order (the typeahead's input). */
    readonly labels: readonly string[];
}

/** The list model of `nodes`, in their order; a repeated key keeps its first place. */
export function createListModel(nodes: readonly ListNode[]): ListModel {
    const indexes = new Map<string, number>();
    const kept: ListNode[] = [];
    for (const node of nodes) {
        if (!indexes.has(node.key)) {
            indexes.set(node.key, kept.length);
            kept.push(node);
        }
    }
    return {
        nodes: kept,
        size: kept.length,
        indexOf: (key) => (key === null ? -1 : (indexes.get(key) ?? -1)),
        isDisabled: (key) => {
            const index = indexes.get(key);
            return index !== undefined && kept[index]?.disabled === true;
        },
        enabledKeys: kept
            .filter((node) => node.disabled !== true)
            .map((node) => node.key),
        labels: kept.map((node) => node.textValue),
    };
}
