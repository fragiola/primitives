import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import {
    SearchFieldKey,
    type SearchFieldState,
} from "./search-field-context.ts";

/** The `searchbox`: Escape clears it, Enter submits it (spec/search-field.md, "Keyboard"). */
export const SearchFieldInput: PartComponent<
    Record<never, never>,
    SearchFieldState
> = publicComponent(
    defineComponent({
        name: "SearchFieldInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                SearchFieldKey,
                "SearchField.Input",
            );
            const { field } = context;
            const onKeydown = (event: KeyboardEvent) => {
                if (event.isComposing) {
                    return;
                }
                if (event.key === "Escape") {
                    if (context.onEscape(event)) {
                        event.preventDefault();
                    }
                } else if (event.key === "Enter") {
                    context.onEnter();
                }
            };
            return () => {
                const state = context.state.value;
                return renderPart("input", { attrs, slots }, props.as, state, {
                    id: context.inputId(),
                    type: "search",
                    name: context.name(),
                    value: state.value,
                    disabled: state.disabled,
                    readonly: state.readOnly,
                    required: state.required,
                    ...field.aria(),
                    "data-primitives-part": "search-field-input",
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
                });
            };
        },
    }),
);
