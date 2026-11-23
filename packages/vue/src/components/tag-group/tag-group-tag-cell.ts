import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { TagGroupTagKey } from "./tag-group-context.ts";

/** A Tag's one `gridcell`: holds its content and its RemoveButton (spec/tag-group.md). */
export const TagGroupTagCell: PartComponent<
    Record<never, never>,
    Record<never, never>
> = publicComponent(
    defineComponent({
        name: "TagGroupTagCell",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            useRequiredContext(TagGroupTagKey, "TagGroup.TagCell");
            return () =>
                renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        role: "gridcell",
                        "data-primitives-part": "tag-group-tag-cell",
                    },
                );
        },
    }),
);
