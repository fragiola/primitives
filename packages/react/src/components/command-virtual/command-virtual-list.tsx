import {
    bestMatch,
    type CommandEntry,
    commandMatches,
} from "@fragiola/primitives/command";
import { type ReactNode, type Ref, useLayoutEffect, useMemo } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    reachableRows,
    useVirtualRows,
    type VirtualListProps,
} from "../../hooks/use-virtual-rows.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import type { PartProps } from "../../utils/render-element.tsx";
import { CommandContext } from "../command/command-context.ts";
import {
    CommandList,
    type CommandListState,
} from "../command/command-list.tsx";

export interface CommandVirtualListProps<
    Entry extends CommandEntry = CommandEntry,
> extends Omit<PartProps<CommandListState>, "children">,
        VirtualListProps {
    /** The entries: the List filters them with the Root's text and `filter`. */
    items: readonly Entry[];
    /** A `Command.Item` for each matching entry in view. */
    children: (entry: Entry, index: number) => ReactNode;
}

/**
 * Command's List rendering only the matching Items in view (spec/command.md, "Virtual list"):
 * the ends, the highlighted Item with its neighbours and the best match stay rendered, so the
 * Input's keys and the highlight behave as with every Item rendered.
 */
export function CommandVirtualList<Entry extends CommandEntry = CommandEntry>({
    items,
    children,
    itemSize,
    measure,
    overscan,
    loading = false,
    onLoadMore,
    ref,
    ...props
}: CommandVirtualListProps<Entry>) {
    const context = useRequiredContext(CommandContext, "CommandVirtual.List");
    const [list, setList] = useElement<HTMLElement>();
    const { search, filter, highlighted } = context;
    const matches = useMemo(
        () => commandMatches(items, search, filter),
        [items, search, filter],
    );
    const { entries } = matches;
    const best = bestMatch(
        matches.scores,
        (index) => entries[index]?.disabled === true,
    );
    const found = entries.findIndex((entry) => entry.value === highlighted);
    const current = found === -1 ? undefined : found;
    const virtual = useVirtualRows({
        items: entries,
        render: children,
        pinned: reachableRows(entries.length, current, best),
        list,
        itemSize,
        measure,
        overscan,
        loading,
        onLoadMore,
    });
    // the highlighted row in view, by its offset (the Item scrolls only within what is rendered)
    const { virtualizer } = virtual;
    useLayoutEffect(() => {
        if (current !== undefined) {
            virtualizer.scrollToIndex(current);
        }
    }, [current, virtualizer]);
    return (
        <CommandList
            {...props}
            ref={mergeRefs(setList, ref as Ref<HTMLElement> | undefined)}
            aria-busy={loading ? "true" : undefined}
            data-loading={loading ? "" : undefined}
        >
            {virtual.rows}
        </CommandList>
    );
}
