import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** The `nav` landmark of the trail; the app names it (`aria-label`) (spec/breadcrumbs.md). */
export const BreadcrumbsRoot: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsRoot",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "nav",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": "breadcrumbs-root",
                    },
                );
        },
    }),
);
