import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CommandKey } from "./command-context.ts";

/**
 * A polite live region, always rendered; its children only while no Item is shown and nothing
 * loads, once mounted (spec/command.md).
 */
export const CommandEmpty: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "CommandEmpty",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CommandKey, "Command.Empty");
            return () => {
                const shown =
                    context.shownCount.value === 0 && !context.loading();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "status",
                        "aria-live": "polite",
                        "aria-atomic": "true",
                        "data-primitives-part": "command-empty",
                    },
                    () => (shown ? slots.default?.({ state: {} }) : undefined),
                );
            };
        },
    }),
);
