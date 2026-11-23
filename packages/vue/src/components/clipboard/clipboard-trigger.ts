import { defineComponent, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ClipboardKey, type ClipboardState } from "./clipboard-context.ts";

/** The button that copies the Root's value (spec/clipboard.md). */
export const ClipboardTrigger: PartComponent<
    Record<never, never>,
    ClipboardState
> = publicComponent(
    defineComponent({
        name: "ClipboardTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ClipboardKey,
                "Clipboard.Trigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // native: Vue's invoker skips events under a fixed test clock
            watch(
                element,
                (button, _, onCleanup) => {
                    if (button === null) {
                        return;
                    }
                    const onClick = (event: MouseEvent) => context.copy(event);
                    button.addEventListener("click", onClick);
                    onCleanup(() =>
                        button.removeEventListener("click", onClick),
                    );
                },
                { flush: "post" },
            );
            return () =>
                renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        type: "button",
                        "data-primitives-part": "clipboard-trigger",
                        ...context.attributes.value,
                        ref: setElement,
                    },
                );
        },
    }),
);
