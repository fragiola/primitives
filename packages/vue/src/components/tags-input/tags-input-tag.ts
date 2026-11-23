import { defineComponent, provide } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputKey, TagsInputTagKey } from "./tags-input-context.ts";

export interface TagsInputTagState {
    disabled: boolean;
    editing: boolean;
}

export interface TagsInputTagProps {
    /** Its position in the value. */
    index: number;
}

/** One tag, focusable out of the tab order (spec/tags-input.md, "Keyboard"). */
export const TagsInputTag: PartComponent<TagsInputTagProps, TagsInputTagState> =
    publicComponent(
        defineComponent({
            name: "TagsInputTag",
            inheritAttrs: false,
            props: {
                ...asProp,
                index: { type: Number, required: true },
            },
            setup(props, { attrs, slots }) {
                const context = useRequiredContext(
                    TagsInputKey,
                    "TagsInput.Tag",
                );
                const editing = () =>
                    context.editing.value?.index === props.index;
                provide(TagsInputTagKey, {
                    index: () => props.index,
                    editing,
                    disabled: context.disabled,
                });
                return () => {
                    const disabled = context.disabled();
                    const state = { disabled, editing: editing() };
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        state,
                        {
                            tabindex: disabled ? undefined : -1,
                            "data-primitives-part": "tags-input-tag",
                            ...stateAttributes(state),
                            onKeydown: (event: KeyboardEvent) => {
                                if (!context.disabled()) {
                                    context.onTagKeydown(event, props.index);
                                }
                            },
                            onDblclick: () => context.startEdit(props.index),
                        },
                    );
                };
            },
        }),
    );
