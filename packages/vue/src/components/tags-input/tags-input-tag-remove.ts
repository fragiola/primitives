import { defineComponent, nextTick } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputKey, TagsInputTagKey } from "./tags-input-context.ts";

export interface TagsInputTagRemoveState {
    disabled: boolean;
}

/** Removes its Tag and focuses the Input (spec/tags-input.md, "Pointer"). */
export const TagsInputTagRemove: PartComponent<
    Record<never, never>,
    TagsInputTagRemoveState
> = publicComponent(
    defineComponent({
        name: "TagsInputTagRemove",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                TagsInputKey,
                "TagsInput.TagRemove",
            );
            const tag = useRequiredContext(
                TagsInputTagKey,
                "TagsInput.TagRemove",
            );
            return () => {
                const disabled = tag.disabled();
                const state = { disabled };
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    tabindex: -1,
                    disabled,
                    hidden: tag.editing() || undefined,
                    "data-primitives-part": "tags-input-tag-remove",
                    ...stateAttributes(state),
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => {
                        context.remove(tag.index(), "chip-remove-press", event);
                        // once the tags that are left render: an edit the removal moved ends
                        // there, by the blur of its own TagInput
                        void nextTick().then(() => context.focusInput());
                    },
                });
            };
        },
    }),
);
