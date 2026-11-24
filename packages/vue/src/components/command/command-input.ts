import { commandKeyTarget } from "@fragiola/primitives/command";
import { defineComponent, nextTick } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CommandKey, shownItems } from "./command-context.ts";

/**
 * The `combobox`: it keeps DOM focus, filters the Items as it is typed in and moves the
 * highlight, announced with `aria-activedescendant` (spec/command.md, "Keyboard").
 */
export const CommandInput: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "CommandInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CommandKey, "Command.Input");

            const onInput = (event: Event) => {
                const element = event.target as HTMLInputElement;
                context.setSearch(element.value, {
                    reason: "input-change",
                    event,
                });
                // a controlled text the consumer kept does not re-render the input: re-assert it
                // once the consumer's update has rendered (spec/README.md, "A controlled value
                // the consumer rejects")
                void nextTick().then(() => {
                    const text = context.search.value;
                    if (element.value !== text) {
                        element.value = text;
                    }
                });
            };

            const onKeydown = (event: KeyboardEvent) => {
                if (event.isComposing) {
                    return;
                }
                const shown = shownItems(context);
                const highlighted = context.highlighted.value;
                const current = shown.findIndex(
                    ({ info }) => info.value === highlighted,
                );
                const target = commandKeyTarget(
                    event,
                    current,
                    shown.length,
                    context.loopFocus(),
                );
                if (target !== null) {
                    event.preventDefault();
                    context.highlighted.value =
                        shown[target]?.info.value ?? null;
                    return;
                }
                if (event.key === "Enter") {
                    const item = shown[current]?.info;
                    if (item !== undefined) {
                        event.preventDefault();
                        if (!item.disabled) {
                            item.select(event);
                        }
                    }
                    return;
                }
                const pages = context.pages.value;
                if (
                    event.key === "Backspace" &&
                    (event.currentTarget as HTMLInputElement).value === "" &&
                    pages.length > 0
                ) {
                    event.preventDefault();
                    context.setPages(pages.slice(0, -1), {
                        reason: "backspace-key",
                        event,
                    });
                }
            };

            return () => {
                const highlighted = context.highlighted.value;
                // the Items registered so far (bumped as they mount and unmount)
                void context.version.value;
                let active: string | undefined;
                for (const info of context.items.values()) {
                    if (info.value === highlighted) {
                        active = info.id;
                    }
                }
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        type: "text",
                        role: "combobox",
                        "aria-expanded": "true",
                        "aria-controls": context.listId,
                        "aria-autocomplete": "list",
                        "aria-activedescendant": active,
                        autocomplete: "off",
                        spellcheck: "false",
                        value: context.search.value,
                        "data-primitives-part": "command-input",
                        onInput,
                        onKeydown,
                    },
                );
            };
        },
    }),
);
