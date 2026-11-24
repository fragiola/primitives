import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CommandKey } from "./command-context.ts";

export interface CommandSeparatorProps {
    /** Shown while there is text too. */
    forceMount?: boolean;
}

/**
 * Between groups, hidden while there is text (the groups it separates may be hidden); no role of
 * its own (a `listbox` owns only groups and options).
 */
export const CommandSeparator: PartComponent<
    CommandSeparatorProps,
    { hidden: boolean }
> = publicComponent(
    defineComponent({
        name: "CommandSeparator",
        inheritAttrs: false,
        props: {
            ...asProp,
            forceMount: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CommandKey, "Command.Separator");
            return () => {
                const hidden =
                    !props.forceMount && context.search.value.trim() !== "";
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { hidden },
                    {
                        role: "presentation",
                        hidden: hidden || undefined,
                        "data-orientation": "horizontal",
                        "data-primitives-part": "command-separator",
                    },
                );
            };
        },
    }),
);
