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
import { CascadeSelectKey } from "./cascade-select-context.ts";

export interface CascadeSelectPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

/** The floating container of the levels (no role of its own; spec/cascade-select.md). */
export const CascadeSelectPopup: PartComponent<
    Record<never, never>,
    CascadeSelectPopupState
> = publicComponent(
    defineComponent({
        name: "CascadeSelectPopup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Popup",
            );
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
                        "data-primitives-part": "cascade-select-popup",
                        ...stateAttributes({
                            open,
                            closed: !open,
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
