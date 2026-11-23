import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** The current page when it is no link: `aria-current="page"` (spec/breadcrumbs.md). */
export const BreadcrumbsCurrent: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsCurrent",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "aria-current": "page",
                        "data-primitives-part": "breadcrumbs-current",
                    },
                );
        },
    }),
);
