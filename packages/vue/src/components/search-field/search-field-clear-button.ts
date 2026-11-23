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

/**
 * Empties the field and focuses the Input; out of the tab order (spec/search-field.md, React
 * Aria's).
 */
export const SearchFieldClearButton: PartComponent<
    Record<never, never>,
    SearchFieldState
> = publicComponent(
    defineComponent({
        name: "SearchFieldClearButton",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                SearchFieldKey,
                "SearchField.ClearButton",
            );
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    tabindex: -1,
                    "aria-controls": context.inputId(),
                    disabled: state.disabled || state.readOnly,
                    "data-primitives-part": "search-field-clear-button",
                    ...context.attributes.value,
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: (event: MouseEvent) => context.clear(event),
                });
            };
        },
    }),
);
