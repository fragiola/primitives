import { stepThroughNone } from "@fragiola/primitives/collection";
import { defineComponent, nextTick, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AutocompleteKey,
    type AutocompletePending,
    highlightedItem,
    orderedItems,
} from "./autocomplete-context.ts";

export interface AutocompleteOpenState {
    open: boolean;
    disabled: boolean;
}

/**
 * The `combobox` and the form control: keeps DOM focus while the list is open; the highlighted
 * suggestion is announced with `aria-activedescendant` (spec/autocomplete.md, "Keyboard").
 */
export const AutocompleteInput: PartComponent<
    Record<never, never>,
    AutocompleteOpenState
> = publicComponent(
    defineComponent({
        name: "AutocompleteInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Input",
            );
            const setInput = elementSetter(context.trigger);
            const inline = () =>
                context.mode() === "both" || context.mode() === "inline";

            // the shown text, written onto the input and its completion string selected, so the
            // next character replaces it (APG)
            watch(
                () => [context.shown.value, context.trigger.value] as const,
                ([shown, element]) => {
                    if (!(element instanceof HTMLInputElement)) {
                        return;
                    }
                    const text = context.text();
                    if (element.value !== text) {
                        element.value = text;
                    }
                    if (
                        shown === null ||
                        element.ownerDocument.activeElement !== element
                    ) {
                        return;
                    }
                    const end = shown.text.length;
                    element.setSelectionRange(shown.selectFrom ?? end, end);
                },
                { flush: "post" },
            );

            const openWith = (pending: AutocompletePending, event?: Event) => {
                context.requestHighlight(pending);
                context.setOpen(true, "list-navigation", event);
            };
            const move = (delta: 1 | -1) => {
                // past an end, the visual focus goes back to the input; from the input, to the near end
                const items = orderedItems(context);
                const index = items.findIndex(
                    (item) => item.id === context.highlighted.value,
                );
                context.highlight(
                    items[stepThroughNone(items.length, index, delta)]?.id ??
                        null,
                    "keyboard",
                );
            };

            const onKeydown = (event: KeyboardEvent) => {
                const open = context.open.value;
                switch (event.key) {
                    case "ArrowDown":
                    case "ArrowUp": {
                        event.preventDefault();
                        if (event.altKey) {
                            if (event.key === "ArrowDown" && !open) {
                                openWith(null, event);
                            } else if (event.key === "ArrowUp" && open) {
                                context.setOpen(
                                    false,
                                    "list-navigation",
                                    event,
                                );
                            }
                            return;
                        }
                        if (!open) {
                            openWith(
                                event.key === "ArrowDown" ? "first" : "last",
                                event,
                            );
                            return;
                        }
                        move(event.key === "ArrowDown" ? 1 : -1);
                        return;
                    }
                    case "Enter": {
                        if (!open) {
                            return;
                        }
                        const active = highlightedItem(context);
                        if (active === undefined) {
                            // no highlight: the list closes and the form may submit
                            context.setOpen(false, "none", event);
                            return;
                        }
                        event.preventDefault();
                        if (!active.disabled) {
                            context.choose(active.value, event);
                        }
                        return;
                    }
                    case "Escape":
                        // the open list's layer takes Escape first; here the list is closed
                        if (!open && context.value.value !== "") {
                            event.preventDefault();
                            context.clear("escape-key", event);
                        }
                        return;
                    case "Tab":
                        if (open) {
                            context.setOpen(false, "focus-out", event);
                        }
                        return;
                    default:
                }
            };

            const onInput = (event: Event) => {
                const element = event.target as HTMLInputElement;
                const inputType = (event as InputEvent).inputType ?? "";
                context.type(
                    element.value,
                    inline() && inputType.startsWith("insert"),
                    event,
                );
                // a controlled value the consumer kept does not re-render the input: re-assert
                // it once the consumer's update has rendered (spec/README.md, "A controlled value
                // the consumer rejects")
                void nextTick().then(() => {
                    const text = context.text();
                    if (element.value !== text) {
                        element.value = text;
                    }
                });
            };

            return () => {
                const open = context.open.value;
                const disabled = context.disabled();
                const highlighted = context.highlighted.value;
                // a rendered option's id only, never a stale one (the item count tracks the options)
                void context.itemCount.value;
                const active =
                    highlighted === null
                        ? undefined
                        : orderedItems(context).find(
                              (item) => item.id === highlighted,
                          );
                const { field } = context;
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        type: "text",
                        id: context.triggerId,
                        role: "combobox",
                        autocomplete: "off",
                        name: context.name(),
                        required: context.required(),
                        disabled,
                        value: context.text(),
                        "aria-autocomplete": context.mode(),
                        "aria-expanded": open ? "true" : "false",
                        "aria-controls": context.listId,
                        "aria-activedescendant":
                            open && active ? active.id : undefined,
                        ...field.aria(),
                        "data-primitives-part": "autocomplete-input",
                        ...field.attributes(),
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onInput,
                        onClick: (event: MouseEvent) => {
                            if (
                                context.openOnInputClick() &&
                                !context.open.value &&
                                !disabled
                            ) {
                                context.setOpen(true, "input-press", event);
                            }
                        },
                        onKeydown,
                        onFocus: field.onFocus,
                        onBlur: field.onBlur,
                        ref: setInput,
                    },
                );
            };
        },
    }),
);
