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

/**
 * The container the popup sits in, covering the page (spec/dialog.md, "Anatomy"): a press on it
 * outside the popup is an outside press.
 */
export interface DialogViewportState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

export const DialogViewport: PartComponent<
    Record<never, never>,
    DialogViewportState
> = publicComponent(
    defineComponent({
        name: "DialogViewport",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(DialogKey, "Dialog.Viewport");
            const setViewport = elementSetter(context.viewport);
            return () => {
                const open = context.open.value;
                const status = context.presence.status.value;
                const nested = context.nested;
                const nestedDialogOpen = context.nestedDialogs.value > 0;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, nested, nestedDialogOpen },
                    {
                        role: "presentation",
                        hidden: context.presence.mounted.value
                            ? undefined
                            : true,
                        "data-primitives-part": `${context.component}-viewport`,
                        ...stateAttributes({
                            open,
                            closed: !open,
                            nested,
                            "nested-dialog-open": nestedDialogOpen,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        ref: setViewport,
                    },
                );
            };
        },
    }),
);
