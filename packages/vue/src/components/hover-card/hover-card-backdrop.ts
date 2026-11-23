import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardKey } from "./hover-card-context.ts";

/** Behind the card while it shows; takes no pointer (spec/hover-card.md). */
export interface HoverCardBackdropState {
    open: boolean;
}

export const HoverCardBackdrop: PartComponent<
    Record<never, never>,
    HoverCardBackdropState
> = publicComponent(
    defineComponent({
        name: "HoverCardBackdrop",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                HoverCardKey,
                "HoverCard.Backdrop",
            );
            return () => {
                const open = context.open.value;
                const status = context.presence.status.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open },
                    {
                        role: "presentation",
                        hidden: context.presence.mounted.value
                            ? undefined
                            : true,
                        "data-primitives-part": "hover-card-backdrop",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                        style: { pointerEvents: "none" },
                    },
                );
            };
        },
    }),
);
