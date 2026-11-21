import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogKey } from "./dialog-context.ts";

export interface DialogBackdropState {
    open: boolean;
}

export const DialogBackdrop: PartComponent<
    Record<never, never>,
    DialogBackdropState
> = publicComponent(
    defineComponent({
        name: "DialogBackdrop",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(DialogKey, "Dialog.Backdrop");
            const setBackdrop = elementSetter(context.backdrop);
            return () => {
                const open = context.open.value;
                const status = context.presence.status.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open },
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "dialog-backdrop",
                        ...stateAttributes({
                            open,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        ref: setBackdrop,
                    },
                );
            };
        },
    }),
);
