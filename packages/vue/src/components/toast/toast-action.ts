import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootKey } from "./toast-context.ts";

/** A toast's action: a button the app wires (spec/toast.md). */
export const ToastAction: PartComponent<
    Record<never, never>,
    { type: string | undefined }
> = publicComponent(
    defineComponent({
        name: "ToastAction",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ToastRootKey, "Toast.Action");
            return () => {
                const type = context.toast().type;
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { type },
                    {
                        type: "button",
                        "data-primitives-part": "toast-action",
                        ...stateAttributes({ type }),
                    },
                );
            };
        },
    }),
);
