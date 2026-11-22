import { type FocusEvent, useCallback, useMemo, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CheckboxGroupContext } from "./checkbox-group-context.ts";

export interface CheckboxGroupState {
    disabled: boolean;
}

export interface CheckboxGroupProps extends PartProps<CheckboxGroupState> {
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
    /** Every child value: what the parent checkbox checks. */
    allValues?: readonly string[];
    disabled?: boolean;
}

const NONE: readonly string[] = [];

/** Checkboxes sharing one array value, with an optional parent (spec/checkbox.md). */
export function CheckboxGroup({
    value: valueProp,
    defaultValue = NONE,
    onValueChange,
    allValues = NONE,
    disabled: disabledProp = false,
    ...props
}: CheckboxGroupProps) {
    const [value, setValue] = useControllableState<
        readonly string[],
        ChangeDetails
    >(valueProp, defaultValue, (next, details) =>
        onValueChange?.([...next], details),
    );
    const [element, ref] = useElement<HTMLElement>();
    // inside a Field, the group is the field's control (spec/checkbox.md): no labelable element,
    // no validated element (`validate` decides), focus from its checkboxes
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value: [...value],
        filled: value.length > 0,
        input: () => null,
        focusTarget: () =>
            element?.querySelector<HTMLElement>(
                '[role="checkbox"]:not([disabled])',
            ) ?? null,
    });
    const disabled = disabledProp || field.disabled;
    const [ids, setIds] = useState<Record<string, string>>({});
    const order = useCallback(
        (values: readonly string[]) =>
            allValues.length === 0
                ? [...values]
                : [
                      ...allValues.filter((entry) => values.includes(entry)),
                      ...values.filter((entry) => !allValues.includes(entry)),
                  ],
        [allValues],
    );
    const toggle = useCallback(
        (entry: string, checked: boolean) => {
            const next = checked
                ? order([...value.filter((item) => item !== entry), entry])
                : value.filter((item) => item !== entry);
            setValue(next, { reason: "none" });
        },
        [value, order, setValue],
    );
    const setAll = useCallback(
        (checked: boolean) =>
            setValue(checked ? [...allValues] : [], { reason: "none" }),
        [allValues, setValue],
    );
    const { reset: markReset } = field;
    const reset = useCallback(() => {
        markReset();
        setValue(defaultValue, { reason: "none" });
    }, [defaultValue, setValue, markReset]);
    const registerId = useCallback((entry: string, id: string | null) => {
        setIds((current) => {
            if (id === null) {
                const { [entry]: _, ...rest } = current;
                return rest;
            }
            return current[entry] === id
                ? current
                : { ...current, [entry]: id };
        });
    }, []);
    const context = useMemo(
        () => ({
            value,
            allValues,
            disabled,
            toggle,
            setAll,
            reset,
            ids,
            registerId,
            inField: field.inField,
            name: field.name,
        }),
        [
            value,
            allValues,
            disabled,
            toggle,
            setAll,
            reset,
            ids,
            registerId,
            field.inField,
            field.name,
        ],
    );
    const state = { disabled };
    return (
        <CheckboxGroupContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "group",
                    ...field.aria,
                    "data-primitives-part": "checkbox-group-root",
                    ...field.attributes,
                    ...stateAttributes({ disabled }),
                    // focus within the group; touched once focus leaves it
                    onFocus: field.onFocus,
                    onBlur: (event: FocusEvent<HTMLElement>) => {
                        const next = event.relatedTarget;
                        if (
                            !(next instanceof Node) ||
                            !event.currentTarget.contains(next)
                        ) {
                            field.onBlur();
                        }
                    },
                },
                ref,
            )}
        </CheckboxGroupContext.Provider>
    );
}
