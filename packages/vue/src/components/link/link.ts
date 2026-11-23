import { defineComponent } from "vue";
import { linkAttributes } from "../../utils/link-attributes.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

export interface LinkState {
    disabled: boolean;
    current: boolean;
}

export interface LinkProps {
    /** The link is unavailable: `aria-disabled`, and its press navigates nowhere. */
    disabled?: boolean;
    /** It links to the page the app is on: `aria-current="page"`. */
    current?: boolean;
}

/**
 * A link with a disabled and a current state (spec/link.md): the app's anchor, or its router's
 * link through `as` (`:as="RouterLink" to="/docs"`: its attributes fall through to the anchor).
 */
export const Link: PartComponent<LinkProps, LinkState> = publicComponent(
    defineComponent({
        name: "LinkRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            disabled: { type: Boolean, default: false },
            current: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            return () => {
                const state = {
                    disabled: props.disabled,
                    current: props.current,
                };
                return renderPart("a", { attrs, slots }, props.as, state, {
                    ...linkAttributes(state),
                    "data-primitives-part": "link-root",
                });
            };
        },
    }),
);
