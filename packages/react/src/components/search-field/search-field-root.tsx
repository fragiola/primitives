import { bridgeForm } from "@fragiola/primitives/form";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SearchFieldContext,
    type SearchFieldContextValue,
    type SearchFieldState,
} from "./search-field-context.ts";

export interface SearchFieldRootProps extends PartProps<SearchFieldState> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    /** Enter in the Input, with the current query. */
    onSubmit?: (value: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

/**
 * Holds a SearchField's query (spec/search-field.md, React Aria's search field): Escape and the
 * ClearButton empty it, Enter submits it.
 */
export function SearchFieldRoot({
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onSubmit,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name,
    id: idProp,
    children,
    ...props
}: SearchFieldRootProps) {
    const generated = useId();
    const inputId = idProp ?? generated;
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const [input, setInputElement] = useState<HTMLInputElement | null>(null);
    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value,
        filled: value !== "",
        input: () => input,
        focusTarget: () => input,
    });
    const disabled = disabledProp || field.disabled;
    const empty = value === "";

    const latest = useRef({
        value,
        disabled,
        readOnly,
        defaultValue,
        setValue,
        onSubmit,
        input,
        reset: field.reset,
    });
    latest.current = {
        value,
        disabled,
        readOnly,
        defaultValue,
        setValue,
        onSubmit,
        input,
        reset: field.reset,
    };

    useEffect(() => {
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const current = latest.current;
                current.reset();
                current.setValue(current.defaultValue, { reason: "none" });
            },
        });
    }, [input]);

    const actions = useMemo(
        () => ({
            onInputText: (text: string, event: Event) => {
                latest.current.setValue(text, {
                    reason: "input-change",
                    event,
                });
            },
            onEscape: (event: Event) => {
                const current = latest.current;
                if (
                    current.value === "" ||
                    current.disabled ||
                    current.readOnly
                ) {
                    // left to the page (spec/search-field.md, "Keyboard")
                    return false;
                }
                current.setValue("", { reason: "escape-key", event });
                return true;
            },
            onEnter: () => {
                const current = latest.current;
                if (!current.disabled && !current.readOnly) {
                    current.onSubmit?.(current.value);
                }
            },
            clear: (event: Event) => {
                const current = latest.current;
                if (current.disabled || current.readOnly) {
                    return;
                }
                if (current.value !== "") {
                    current.setValue("", { reason: "clear-press", event });
                }
                current.input?.focus();
            },
        }),
        [],
    );

    const state: SearchFieldState = {
        value,
        empty,
        disabled,
        readOnly,
        required,
    };
    const attributes = useMemo(
        () =>
            stateAttributes({
                empty,
                disabled,
                readonly: readOnly,
                required,
            }),
        [empty, disabled, readOnly, required],
    );
    const context = useMemo<SearchFieldContextValue>(
        () => ({
            value,
            empty,
            disabled,
            readOnly,
            required,
            inputId,
            name: field.name ?? name,
            field,
            attributes,
            ...actions,
            setInputElement,
        }),
        [
            value,
            empty,
            disabled,
            readOnly,
            required,
            inputId,
            name,
            field,
            attributes,
            actions,
        ],
    );
    return (
        <SearchFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": "search-field-root",
                ...attributes,
                ...field.attributes,
            })}
        </SearchFieldContext.Provider>
    );
}
