import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ClipboardKey, type ClipboardState } from "./clipboard-context.ts";

/** Shows the Root's value, read-only (spec/clipboard.md). */
export const ClipboardInput: PartComponent<
    Record<never, never>,
    ClipboardState
> = publicComponent(
    defineComponent({
        name: "ClipboardInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ClipboardKey, "Clipboard.Input");
            return () =>
                renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        type: "text",
                        readonly: true,
                        value: context.value(),
                        "data-primitives-part": "clipboard-input",
                        ...context.attributes.value,
                        ref: context.setInput,
                    },
                );
        },
    }),
);
