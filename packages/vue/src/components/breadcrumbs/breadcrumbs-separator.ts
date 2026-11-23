import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** Between two Items: a list item hidden from assistive technology, its children the app's (spec/breadcrumbs.md). */
export const BreadcrumbsSeparator: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsSeparator",
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
                        "aria-hidden": "true",
                        "data-primitives-part": "breadcrumbs-separator",
                    },
                );
        },
    }),
);
