import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarSeparatorState {
    /** Across the toolbar's: `"vertical"` in a horizontal toolbar. */
    orientation: "horizontal" | "vertical";
}

/** A separator across a toolbar's orientation (spec/toolbar.md), not focusable. */
export const ToolbarSeparator: PartComponent<
    Record<never, never>,
    ToolbarSeparatorState
> = publicComponent(
    defineComponent({
        name: "ToolbarSeparator",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const toolbar = useRequiredContext(ToolbarKey, "Toolbar.Separator");
            return () => {
                const orientation =
                    toolbar.orientation() === "horizontal"
                        ? "vertical"
                        : "horizontal";
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { orientation },
                    {
                        role: "separator",
                        "aria-orientation": orientation,
                        "data-primitives-part": "toolbar-separator",
                        ...stateAttributes({ orientation }),
                    },
                );
            };
        },
    }),
);
