import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** The trail, an ordered list (spec/breadcrumbs.md). */
export const BreadcrumbsList: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsList",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "ol",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": "breadcrumbs-list",
                    },
                );
        },
    }),
);
