import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { TagsInputTagKey } from "./tags-input-context.ts";

export interface TagsInputTagTextState {
    editing: boolean;
}

/** A Tag's text (the consumer's content); hidden while the tag is edited. */
export const TagsInputTagText: PartComponent<
    Record<never, never>,
    TagsInputTagTextState
> = publicComponent(
    defineComponent({
        name: "TagsInputTagText",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const tag = useRequiredContext(
                TagsInputTagKey,
                "TagsInput.TagText",
            );
            return () => {
                const editing = tag.editing();
                return renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    { editing },
                    {
                        hidden: editing || undefined,
                        "data-primitives-part": "tags-input-tag-text",
                    },
                );
            };
        },
    }),
);
