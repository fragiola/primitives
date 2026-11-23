import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputKey } from "./tags-input-context.ts";

export interface TagsInputControlState {
    disabled: boolean;
    empty: boolean;
}

/** Holds the Tags and the Input; a press on it, outside them, focuses the Input (spec/tags-input.md). */
export const TagsInputControl: PartComponent<
    Record<never, never>,
    TagsInputControlState
> = publicComponent(
    defineComponent({
        name: "TagsInputControl",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                TagsInputKey,
                "TagsInput.Control",
            );
            return () => {
                const disabled = context.disabled();
                const state = { disabled, empty: context.empty.value };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "tags-input-control",
                    ...stateAttributes(state),
                    onMousedown: (event: MouseEvent) => {
                        if (
                            event.target === event.currentTarget &&
                            !context.disabled()
                        ) {
                            event.preventDefault();
                            context.focusInput();
                        }
                    },
                });
            };
        },
    }),
);
