import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** One step of the trail (spec/breadcrumbs.md). */
export const BreadcrumbsItem: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsItem",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "li",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": "breadcrumbs-item",
                    },
                );
        },
    }),
);
