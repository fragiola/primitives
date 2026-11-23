import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputKey } from "./tags-input-context.ts";

export interface TagsInputClearTriggerState {
    disabled: boolean;
}

/**
 * Removes every tag and the text, and focuses the Input; hidden while there is nothing to clear
 * (spec/tags-input.md).
 */
export const TagsInputClearTrigger: PartComponent<
    Record<never, never>,
    TagsInputClearTriggerState
> = publicComponent(
    defineComponent({
        name: "TagsInputClearTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                TagsInputKey,
                "TagsInput.ClearTrigger",
            );
            return () => {
                const disabled = context.disabled();
                const state = { disabled };
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    disabled,
                    hidden:
                        (context.empty.value && context.text.value === "") ||
                        undefined,
                    "data-primitives-part": "tags-input-clear-trigger",
                    ...stateAttributes(state),
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => context.clear(event),
                });
            };
        },
    }),
);
