import { type ReactNode, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext, orderedItems } from "./autocomplete-context.ts";

export interface AutocompleteListProps<Entry = unknown>
    extends Omit<PartProps<{ empty: boolean }>, "children"> {
    /**
     * Nodes, or a render function of each matching entry (a suggestion, or a group). `Entry` is
     * the consumer's own type, inferred from the function's parameter.
     */
    children?: ReactNode | ((entry: Entry, index: number) => ReactNode);
}

/**
 * The `listbox`. Applies the highlight the keyboard or the typing asked for once its suggestions
 * render, and drops a highlight whose suggestion is gone (new `items`).
 */
export function AutocompleteList<Entry = unknown>({
    children,
    ...props
}: AutocompleteListProps<Entry>) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.List",
    );
    const { list, pending, itemCount, open, pendingTick, entries } = context;

    // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the list opens, its items change or a highlight is asked for
    useLayoutEffect(() => {
        if (list === null) {
            return;
        }
        const items = orderedItems(context);
        const asked = pending.current;
        if (asked !== null && open) {
            pending.current = null;
            if (asked === "complete") {
                const typed = context.value.toLowerCase();
                const match = items.find(
                    (item) =>
                        !item.disabled &&
                        context
                            .label(item.value)
                            .toLowerCase()
                            .startsWith(typed),
                );
                if (match !== undefined) {
                    context.complete(match);
                }
                return;
            }
            const target = asked === "first" ? items[0] : items.at(-1);
            context.highlight(target?.id ?? null, "keyboard");
            return;
        }
        if (
            context.highlighted !== null &&
            !items.some((item) => item.id === context.highlighted)
        ) {
            context.highlight(null, "keyboard");
        }
    }, [list, itemCount, open, pendingTick, entries]);

    const empty = context.hasItems ? entries.length === 0 : itemCount === 0;
    const content =
        typeof children === "function"
            ? entries.map((entry, index) =>
                  // the Root holds the consumer's items: the render function names their type
                  children(entry as Entry, index),
              )
            : children;
    return renderElement(
        "div",
        { ...props, children: content },
        { empty },
        {
            role: "listbox",
            id: context.listId,
            "data-primitives-part": "autocomplete-list",
            ...stateAttributes({ empty }),
        },
        context.setList,
    );
}
