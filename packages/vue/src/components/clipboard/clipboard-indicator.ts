import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ClipboardKey, type ClipboardState } from "./clipboard-context.ts";

/**
 * Follows the status: the app's icons (its default scoped slot receives the state), hidden from
 * the accessibility tree (spec/clipboard.md).
 */
export const ClipboardIndicator: PartComponent<
    Record<never, never>,
    ClipboardState
> = publicComponent(
    defineComponent({
        name: "ClipboardIndicator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ClipboardKey,
                "Clipboard.Indicator",
            );
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "clipboard-indicator",
                        ...context.attributes.value,
                    },
                );
        },
    }),
);
