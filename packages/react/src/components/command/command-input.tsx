import { commandKeyTarget } from "@fragiola/primitives/command";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CommandContext, shownItems } from "./command-context.ts";

/**
 * The `combobox`: it keeps DOM focus, filters the Items as it is typed in and moves the
 * highlight, announced with `aria-activedescendant` (spec/command.md, "Keyboard").
 */
export function CommandInput(props: PartProps<Record<string, never>>) {
    const context = useRequiredContext(CommandContext, "Command.Input");
    const { search, highlighted, items } = context;
    let active: string | undefined;
    for (const info of items.values()) {
        if (info.value === highlighted) {
            active = info.id;
        }
    }
    return renderElement(
        "input",
        props,
        {},
        {
            type: "text",
            role: "combobox",
            "aria-expanded": "true",
            "aria-controls": context.listId,
            "aria-autocomplete": "list",
            "aria-activedescendant": active,
            autoComplete: "off",
            spellCheck: false,
            value: search,
            "data-primitives-part": "command-input",
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
                context.setSearch(event.target.value, {
                    reason: "input-change",
                    event: event.nativeEvent,
                }),
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.nativeEvent.isComposing) {
                    return;
                }
                const shown = shownItems(context);
                const current = shown.findIndex(
                    ({ info }) => info.value === highlighted,
                );
                const target = commandKeyTarget(
                    event,
                    current,
                    shown.length,
                    context.loopFocus,
                );
                if (target !== null) {
                    event.preventDefault();
                    context.highlight(shown[target]?.info.value ?? null);
                    return;
                }
                if (event.key === "Enter") {
                    const item = shown[current]?.info;
                    if (item !== undefined) {
                        event.preventDefault();
                        if (!item.disabled) {
                            item.onSelect?.(item.value, event.nativeEvent);
                        }
                    }
                    return;
                }
                if (
                    event.key === "Backspace" &&
                    event.currentTarget.value === "" &&
                    context.pages.length > 0
                ) {
                    event.preventDefault();
                    context.setPages(context.pages.slice(0, -1), {
                        reason: "backspace-key",
                        event: event.nativeEvent,
                    });
                }
            },
        },
    );
}
