import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** The collapsed middle of the trail: a native button the app names and composes with a Menu's trigger (`:as="Menu.Trigger"`) (spec/breadcrumbs.md). */
export const BreadcrumbsEllipsis: PartComponent<
    Record<never, never>,
    Record<string, never>
> = publicComponent(
    defineComponent({
        name: "BreadcrumbsEllipsis",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        type: "button",
                        "data-primitives-part": "breadcrumbs-ellipsis",
                    },
                );
        },
    }),
);
