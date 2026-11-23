import { defineComponent, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootKey } from "./toast-context.ts";

/** Closes its toast (spec/toast.md). */
export const ToastClose: PartComponent<
    Record<never, never>,
    { type: string | undefined }
> = publicComponent(
    defineComponent({
        name: "ToastClose",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ToastRootKey, "Toast.Close");
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            // native: Vue's invoker skips events under a fixed test clock
            watch(
                element,
                (button, _, onCleanup) => {
                    if (button === null) {
                        return;
                    }
                    const onClick = (event: MouseEvent) => {
                        if (!event.defaultPrevented) {
                            context.close();
                        }
                    };
                    button.addEventListener("click", onClick);
                    onCleanup(() =>
                        button.removeEventListener("click", onClick),
                    );
                },
                { flush: "post" },
            );
            return () => {
                const type = context.toast().type;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { type },
                    {
                        type: "button",
                        "data-primitives-part": "toast-close",
                        ...stateAttributes({ type }),
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
