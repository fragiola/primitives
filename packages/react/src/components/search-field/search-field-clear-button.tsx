import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    SearchFieldContext,
    type SearchFieldState,
    searchFieldState,
} from "./search-field-context.ts";

export type SearchFieldClearButtonProps = PartProps<SearchFieldState>;

/**
 * Empties the field and focuses the Input; out of the tab order (spec/search-field.md, React
 * Aria's).
 */
export function SearchFieldClearButton(props: SearchFieldClearButtonProps) {
    const context = useRequiredContext(
        SearchFieldContext,
        "SearchField.ClearButton",
    );
    return renderElement("button", props, searchFieldState(context), {
        type: "button",
        tabIndex: -1,
        "aria-controls": context.inputId,
        disabled: context.disabled || context.readOnly,
        "data-primitives-part": "search-field-clear-button",
        ...context.attributes,
        onMouseDown: (event: MouseEvent) => event.preventDefault(),
        onClick: (event: MouseEvent) => context.clear(event.nativeEvent),
    });
}
