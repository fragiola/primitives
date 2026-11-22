import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuKey } from "./navigation-menu-context.ts";

/** Covers the page while a Content is open; decorative. */
export const NavigationMenuBackdrop: PartComponent<
    Record<never, never>,
    { open: boolean }
> = publicComponent(
    defineComponent({
        name: "NavigationMenuBackdrop",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Backdrop",
            );
            return () => {
                const open = context.value.value !== null;
                const status = context.presence.status.value;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open },
                    {
                        "aria-hidden": "true",
                        "data-primitives-part": "navigation-menu-backdrop",
                        ...stateAttributes({
                            open,
                            closed: !open,
                            "starting-style": status === "starting",
                            "ending-style": status === "ending",
                        }),
                    },
                );
            };
        },
    }),
);
