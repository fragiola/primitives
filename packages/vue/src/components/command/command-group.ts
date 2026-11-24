import { defineComponent, provide, ref, shallowRef, useId, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CommandGroupKey, CommandKey } from "./command-context.ts";

/** A `group` of Items, named by its GroupLabel, hidden while it shows none (spec/command.md). */
export const CommandGroup: PartComponent<
    Record<never, never>,
    { hidden: boolean }
> = publicComponent(
    defineComponent({
        name: "CommandGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CommandKey, "Command.Group");
            const labelId = `${useId()}-label`;
            provide(CommandGroupKey, { labelId });
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const hidden = ref(false);
            // hidden while it shows no Item: checked once its Items rendered for a new text, a
            // new filter or Items mounting and unmounting
            watch(
                () =>
                    [
                        element.value,
                        context.search.value,
                        context.filter(),
                        context.version.value,
                    ] as const,
                ([node]) => {
                    if (node !== null) {
                        hidden.value =
                            node.querySelector(
                                '[role="option"]:not([hidden])',
                            ) === null;
                    }
                },
                { flush: "post", immediate: true },
            );
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { hidden: hidden.value },
                    {
                        role: "group",
                        "aria-labelledby": labelId,
                        hidden: hidden.value || undefined,
                        "data-primitives-part": "command-group",
                        ref: setElement,
                    },
                );
        },
    }),
);
