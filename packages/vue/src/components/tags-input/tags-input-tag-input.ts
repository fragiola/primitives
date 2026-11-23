import { defineComponent, shallowRef, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    composing,
    TagsInputKey,
    TagsInputTagKey,
} from "./tags-input-context.ts";

export interface TagsInputTagInputState {
    editing: boolean;
}

/**
 * Edits its Tag in place (spec/tags-input.md, "Editing a tag"): `hidden` until the tag is edited,
 * then focused with its text selected.
 */
export const TagsInputTagInput: PartComponent<
    Record<never, never>,
    TagsInputTagInputState
> = publicComponent(
    defineComponent({
        name: "TagsInputTagInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                TagsInputKey,
                "TagsInput.TagInput",
            );
            const tag = useRequiredContext(
                TagsInputTagKey,
                "TagsInput.TagInput",
            );
            const element = shallowRef<HTMLInputElement | null>(null);
            const setElement = (node: unknown) => {
                element.value =
                    node instanceof HTMLInputElement
                        ? node
                        : ((node as { $el?: HTMLInputElement } | null)?.$el ??
                          null);
            };
            // the edit starts: it takes the focus once shown
            watch(
                tag.editing,
                (editing) => {
                    if (editing) {
                        element.value?.focus();
                        element.value?.select();
                    }
                },
                { flush: "post" },
            );
            return () => {
                const editing = tag.editing();
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    { editing },
                    {
                        tabindex: -1,
                        hidden: !editing || undefined,
                        disabled: context.disabled(),
                        value: editing
                            ? (context.editing.value?.text ?? "")
                            : "",
                        "data-primitives-part": "tags-input-tag-input",
                        onInput: (event: Event) =>
                            context.setEditText(
                                (event.target as HTMLInputElement).value,
                            ),
                        onKeydown: (event: KeyboardEvent) => {
                            if (!editing || composing(event)) {
                                return;
                            }
                            if (event.key === "Enter") {
                                event.preventDefault();
                                context.commitEdit("keyboard", event, true);
                            } else if (event.key === "Escape") {
                                event.preventDefault();
                                context.cancelEdit();
                            }
                        },
                        onBlur: (event: FocusEvent) =>
                            context.onTagInputBlur(tag.index(), event),
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
