import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { TagsInputKey } from "./tags-input-context.ts";

export interface TagsInputInputState {
    disabled: boolean;
    empty: boolean;
}

/** The text the next tag is typed in: the labelled control (spec/tags-input.md). */
export const TagsInputInput: PartComponent<
    Record<never, never>,
    TagsInputInputState
> = publicComponent(
    defineComponent({
        name: "TagsInputInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(TagsInputKey, "TagsInput.Input");
            return () => {
                const disabled = context.disabled();
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    { disabled, empty: context.empty.value },
                    {
                        id: context.inputId,
                        value: context.text.value,
                        disabled,
                        "aria-required": context.required()
                            ? "true"
                            : undefined,
                        ...context.fieldAria(),
                        "data-primitives-part": "tags-input-input",
                        onInput: context.onInputInput,
                        onKeydown: context.onInputKeydown,
                        onPaste: context.onInputPaste,
                        ref: context.setInput,
                    },
                );
            };
        },
    }),
);
