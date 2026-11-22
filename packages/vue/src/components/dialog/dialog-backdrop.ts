import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogKey, nestedName } from "./dialog-context.ts";

export interface DialogBackdropState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

export interface DialogBackdropProps {
    /** A nested dialog's Backdrop renders only with it (default `false`; spec/dialog.md). */
    forceRender?: boolean;
}

export const DialogBackdrop: PartComponent<
    DialogBackdropProps,
    DialogBackdropState
> = publicComponent(
    defineComponent({
        name: "DialogBackdrop",
        inheritAttrs: false,
        props: { ...asProp, forceRender: { type: Boolean, default: false } },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(DialogKey, "Dialog.Backdrop");
            const setBackdrop = elementSetter(context.backdrop);
            return () => {
                const nested = context.nested;
                if (nested && !props.forceRender) {
                    return null;
                }
                const open = context.open.value;
                const status = context.presence.status.value;
                const nestedDialogOpen = context.nestedDialogs.value > 0;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, nested, nestedDialogOpen },
                    {
                        "aria-hidden": "true",
                        hidden: context.presence.mounted.value
                            ? undefined
                            : true,
                        "data-primitives-part": `${context.component}-backdrop`,
                        ...stateAttributes({
                            open,
                            closed: !open,
                            nested,
                            [`nested-${nestedName(context.component)}-open`]:
                                nestedDialogOpen,
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
