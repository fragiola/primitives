import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ComboboxKey } from "./combobox-context.ts";

export interface ComboboxPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

/** The floating container of the list (no role of its own). */
export const ComboboxPopup: PartComponent<
    Record<never, never>,
    ComboboxPopupState
> = publicComponent(
    defineComponent({
        name: "ComboboxPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Popup");
            const setPopup = elementSetter(context.popup);
            return () => {
                const open = context.open.value;
                const status = context.presence.status.value;
                const placed = context.placed.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, ...placed },
                    {
                        "data-primitives-part": "combobox-popup",
                        ...stateAttributes({
                            open,
                            side: placed.side,
                            align: placed.align,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        ref: setPopup,
                    },
                );
            };
        },
    }),
);
