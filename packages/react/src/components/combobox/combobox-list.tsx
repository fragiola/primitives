import { type ReactNode, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ComboboxContext, orderedItems } from "./combobox-context.ts";

export interface ComboboxListProps<Entry = unknown>
    extends Omit<PartProps<{ empty: boolean }>, "children"> {
    /**
     * Nodes, or a render function of each matching entry (an item, or a group). `Entry` is the
     * consumer's own type, inferred from the function's parameter.
     */
    children?: ReactNode | ((entry: Entry, index: number) => ReactNode);
}

/** The `listbox`. Applies the highlight the keyboard asked for once its items render. */
export function ComboboxList<Entry = unknown>({
    children,
    ...props
}: ComboboxListProps<Entry>) {
    const context = useRequiredContext(ComboboxContext, "Combobox.List");
    const {
        list,
        pendingHighlight,
        setHighlighted,
        itemCount,
        open,
        inputValue,
    } = context;

    // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the list opens, its items or its text change
    useLayoutEffect(() => {
        const pending = pendingHighlight.current;
        if (list === null || pending === null) {
            return;
        }
        pendingHighlight.current = null;
        const items = orderedItems(context);
        if (pending === "typed") {
            setHighlighted(items[0]?.id ?? null);
            return;
        }
        const selected = context.multiple
            ? undefined
            : items.find((item) => context.isSelected(item.value));
        const edge = pending === "first" ? items[0] : items.at(-1);
        const target = selected ?? (pending === "selected" ? undefined : edge);
        setHighlighted(target?.id ?? null);
    }, [list, itemCount, open, inputValue]);

    const empty = context.hasItems
        ? context.entries.length === 0
        : itemCount === 0;
    const content =
        typeof children === "function"
            ? context.entries.map((entry, index) =>
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
            "aria-multiselectable": context.multiple ? "true" : undefined,
            "data-primitives-part": "combobox-list",
            ...stateAttributes({ empty }),
        },
        context.setList,
    );
}
