import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { EditableKey, type EditableState } from "./editable-context.ts";

/**
 * The text field (an `input`, or a `textarea` with `as="textarea"`): `hidden` until an edit
 * starts; Enter commits and Escape reverts (spec/editable.md, "Keyboard"); the form control.
 */
export const EditableInput: PartComponent<
    Record<never, never>,
    EditableState
> = publicComponent(
    defineComponent({
        name: "EditableInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(EditableKey, "Editable.Input");
            const { field } = context;
            const onKeydown = (event: KeyboardEvent) => {
                if (!context.state.value.editing || event.isComposing) {
                    return;
                }
                if (event.key === "Escape") {
                    event.preventDefault();
                    context.revert("escape-key", event);
                    return;
                }
                const mode = context.submitMode();
                if (
                    event.key !== "Enter" ||
                    (mode !== "enter" && mode !== "both")
                ) {
                    return;
                }
                const textarea =
                    (event.currentTarget as Element).localName === "textarea";
                if (textarea && !event.ctrlKey && !event.metaKey) {
                    return;
                }
                event.preventDefault();
                context.commit("keyboard", event);
            };
            return () => {
                const state = context.state.value;
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        id: context.inputId(),
                        name: context.name(),
                        value: state.value,
                        hidden: !state.editing || undefined,
                        placeholder: context.placeholder(),
                        maxlength: context.maxLength(),
                        disabled: state.disabled,
                        required: state.required,
                        ...field.aria(),
                        "data-primitives-part": "editable-input",
                        ...context.attributes.value,
                        ...field.attributes(),
                        onInput: (event: Event) =>
                            context.onInputText(
                                (event.target as HTMLInputElement).value,
                                event,
                            ),
                        onKeydown,
                        onFocus: field.onFocus,
                        onBlur: field.onBlur,
                        ref: context.setInput,
                    },
                    // a server renders a textarea's value as its text: the client's vnode holds the
                    // same text, so the hydration matches (`value`, also set, wins once the user typed)
                    props.as === "textarea" ? () => state.value : undefined,
                );
            };
        },
    }),
);
