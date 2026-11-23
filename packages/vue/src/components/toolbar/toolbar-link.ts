import type { RovingOrientation } from "@fragiola/primitives/collection";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useRovingItem } from "../../composables/use-roving-item.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarKey } from "./toolbar-context.ts";

export interface ToolbarLinkState {
    orientation: RovingOrientation;
}

/** A link of a toolbar (spec/toolbar.md): an item of the toolbar's focus; it cannot be disabled. */
export const ToolbarLink: PartComponent<
    Record<never, never>,
    ToolbarLinkState
> = publicComponent(
    defineComponent({
        name: "ToolbarLink",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const toolbar = useRequiredContext(ToolbarKey, "Toolbar.Link");
            const item = useRovingItem(() => true);
            const onFocus = () => item?.onFocus();
            return () => {
                const orientation = toolbar.orientation();
                return renderPart(
                    "a",
                    { attrs, slots },
                    props.as,
                    { orientation },
                    {
                        tabindex: item?.tabIndex(),
                        "data-primitives-part": "toolbar-link",
                        ...stateAttributes({ orientation }),
                        onFocus,
                        ...(item === null ? {} : { ref: item.ref }),
                    },
                );
            };
        },
    }),
);
