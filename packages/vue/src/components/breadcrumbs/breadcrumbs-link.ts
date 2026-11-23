import { defineComponent } from "vue";
import { linkAttributes } from "../../utils/link-attributes.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

export interface BreadcrumbsLinkState {
    disabled: boolean;
    current: boolean;
}

export interface BreadcrumbsLinkProps {
    /** It links to the current page: `aria-current="page"`. */
    current?: boolean;
    /** The link is unavailable, as Link's (spec/link.md). */
    disabled?: boolean;
}

/** A parent page of the trail (spec/breadcrumbs.md): Link's behaviour (spec/link.md). */
export const BreadcrumbsLink: PartComponent<
    BreadcrumbsLinkProps,
    BreadcrumbsLinkState
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsLink",
        inheritAttrs: false,
        props: {
            ...asProp,
            current: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            return () => {
                const state = {
                    disabled: props.disabled,
                    current: props.current,
                };
                return renderPart("a", { attrs, slots }, props.as, state, {
                    ...linkAttributes(state),
                    "data-primitives-part": "breadcrumbs-link",
                });
            };
        },
    }),
);
