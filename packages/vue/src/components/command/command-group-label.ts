import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CommandGroupKey } from "./command-context.ts";

/** Names its Group. */
export const CommandGroupLabel: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "CommandGroupLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const group = useRequiredContext(
                CommandGroupKey,
                "Command.GroupLabel",
            );
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        id: group.labelId,
                        "data-primitives-part": "command-group-label",
                    },
                );
        },
    }),
);
