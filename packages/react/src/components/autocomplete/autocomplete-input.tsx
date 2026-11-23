import { stepThroughNone } from "@fragiola/primitives/collection";
import {
    type ChangeEvent,
    type KeyboardEvent,
    useLayoutEffect,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AutocompleteContext,
    type AutocompletePending,
    orderedItems,
} from "./autocomplete-context.ts";

/**
 * The `combobox` and the form control: keeps DOM focus while the list is open; the highlighted
 * suggestion is announced with `aria-activedescendant` (spec/autocomplete.md, "Keyboard").
 */
export function AutocompleteInput(
    props: PartProps<{ open: boolean; disabled: boolean }>,
) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Input",
    );
    const { open, disabled, highlighted, field, shown, mode } = context;
    const items = orderedItems(context);
    const active = items.find((item) => item.id === highlighted);
    const element = useRef<HTMLInputElement | null>(null);
    const inline = mode === "both" || mode === "inline";

    // the completion string is selected, so the next character replaces it (APG)
    useLayoutEffect(() => {
        const input = element.current;
        if (
            input === null ||
            shown === null ||
            input.ownerDocument.activeElement !== input
        ) {
            return;
        }
        const end = shown.text.length;
        input.setSelectionRange(shown.selectFrom ?? end, end);
    }, [shown]);

    const openWith = (pending: AutocompletePending, event?: Event) => {
        context.requestHighlight(pending);
        context.setOpen(true, "list-navigation", event);
    };
    const move = (delta: 1 | -1) => {
        // past an end, the visual focus goes back to the input; from the input, to the near end
        const index = items.findIndex((item) => item.id === highlighted);
        context.highlight(
            items[stepThroughNone(items.length, index, delta)]?.id ?? null,
            "keyboard",
        );
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp": {
                event.preventDefault();
                if (event.altKey) {
                    if (event.key === "ArrowDown" && !open) {
                        openWith(null, event.nativeEvent);
                    } else if (event.key === "ArrowUp" && open) {
                        context.setOpen(
                            false,
                            "list-navigation",
                            event.nativeEvent,
                        );
                    }
                    return;
                }
                if (!open) {
                    openWith(
                        event.key === "ArrowDown" ? "first" : "last",
                        event.nativeEvent,
                    );
                    return;
                }
                move(event.key === "ArrowDown" ? 1 : -1);
                return;
            }
            case "Enter":
                if (!open) {
                    return;
                }
                if (active === undefined) {
                    // no highlight: the list closes and the form may submit
                    context.setOpen(false, "none", event.nativeEvent);
                    return;
                }
                event.preventDefault();
                if (!active.disabled) {
                    context.choose(active.value, event.nativeEvent);
                }
                return;
            case "Escape":
                // the open list's layer takes Escape first; here the list is closed
                if (!open && context.value !== "") {
                    event.preventDefault();
                    context.clear("escape-key", event.nativeEvent);
                }
                return;
            case "Tab":
                if (open) {
                    context.setOpen(false, "focus-out", event.nativeEvent);
                }
                return;
            default:
        }
    };

    const state = { open, disabled };
    return renderElement(
        "input",
        props,
        state,
        {
            type: "text",
            id: context.triggerId,
            role: "combobox",
            autoComplete: "off",
            name: context.name,
            required: context.required,
            disabled,
            value: shown?.text ?? context.value,
            "aria-autocomplete": mode,
            "aria-expanded": open,
            "aria-controls": context.listId,
            "aria-activedescendant": open && active ? active.id : undefined,
            ...field.aria,
            "data-primitives-part": "autocomplete-input",
            ...field.attributes,
            ...stateAttributes({ "popup-open": open, disabled }),
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                const native = event.nativeEvent as InputEvent;
                const addition = (native.inputType ?? "").startsWith("insert");
                context.type(event.target.value, inline && addition, native);
            },
            onClick: (event: { nativeEvent: Event }) => {
                if (context.openOnInputClick && !open && !disabled) {
                    context.setOpen(true, "input-press", event.nativeEvent);
                }
            },
            onKeyDown,
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        mergeRefs(context.setTrigger, (node: HTMLElement | null) => {
            element.current = node as HTMLInputElement | null;
        }),
    );
}
