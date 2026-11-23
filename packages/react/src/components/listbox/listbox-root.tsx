import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    applySelection,
    createListModel,
    type ListModel,
    listKeyTarget,
    listPressSelection,
    pageTarget,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    type FocusEvent,
    type KeyboardEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ListboxContext, type ListboxItemEntry } from "./listbox-context.ts";

export interface ListboxRootState {
    multiple: boolean;
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

interface ListboxRootCommonProps extends PartProps<ListboxRootState> {
    /** The APG's selection model (default `"toggle"`, the recommended one). */
    selectionBehavior?: SelectionBehavior;
    /** `aria-orientation`; a horizontal list moves with ArrowLeft and ArrowRight. */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last option to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
    /** The form's validation fails while nothing is selected. */
    required?: boolean;
}

export interface ListboxRootSingleProps extends ListboxRootCommonProps {
    multiple?: false;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
}

export interface ListboxRootMultipleProps extends ListboxRootCommonProps {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
}

export type ListboxRootProps =
    | ListboxRootSingleProps
    | ListboxRootMultipleProps;

const NONE: readonly string[] = [];
const NOOP = () => {};

/** The items in document order. */
function inOrder(entries: readonly ListboxItemEntry[]): ListboxItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The list model of the rendered items (`@fragiola/primitives/selection`). */
function modelOf(
    entries: readonly ListboxItemEntry[],
    disabled: boolean,
): ListModel {
    return createListModel(
        entries.map((entry) => ({
            key: entry.value,
            textValue: entry.label ?? entry.element.textContent ?? "",
            disabled: disabled || entry.disabled,
        })),
    );
}

/**
 * A list of options for choosing one value or several (spec/listbox.md, the APG listbox): the
 * `listbox`, its roving focus, the selection models, typeahead, and the hidden form inputs.
 */
export function ListboxRoot(props: ListboxRootProps) {
    const {
        multiple = false,
        value: valueProp,
        defaultValue: defaultValueProp,
        onValueChange,
        selectionBehavior = "toggle",
        orientation = "vertical",
        loopFocus = true,
        disabled: disabledProp = false,
        name,
        required = false,
        children,
        ...rest
    } = props;
    const defaultValue: unknown = defaultValueProp ?? (multiple ? NONE : null);
    const [value, setValue] = useControllableState<unknown, ChangeDetails>(
        valueProp,
        defaultValue,
        onValueChange as
            | ((value: unknown, details: ChangeDetails) => void)
            | undefined,
    );
    const selected = useMemo<readonly string[]>(() => {
        if (multiple) {
            return (value as readonly string[] | null) ?? NONE;
        }
        return value === null || value === undefined ? NONE : [value as string];
    }, [multiple, value]);
    const [element, ref] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [entries, setEntries] = useState<readonly ListboxItemEntry[]>([]);
    const ordered = useMemo(() => inOrder(entries), [entries]);
    const [active, setActive] = useState<HTMLElement | null>(null);
    const [within, setWithin] = useState(false);
    const anchor = useRef<string | null>(null);
    const typeahead = useRef(createTypeahead());
    const validation = useRef<HTMLInputElement>(null);

    const tabStopOf = useCallback(
        (items: readonly ListboxItemEntry[], current: readonly string[]) => {
            if (items.length === 0) {
                return null;
            }
            if (within && active !== null) {
                const focused = items.find((entry) => entry.element === active);
                if (focused !== undefined) {
                    return focused.element;
                }
            }
            return (
                items.find((entry) => current.includes(entry.value))?.element ??
                items[0]?.element ??
                null
            );
        },
        [within, active],
    );
    const latest = useRef({ ordered, selected, tabStopOf });
    latest.current = { ordered, selected, tabStopOf };
    const tabStopElement = useCallback(() => {
        const current = latest.current;
        return current.tabStopOf(current.ordered, current.selected);
    }, []);

    // inside a Field, the list is the field's control (spec/listbox.md, "Forms"), as RadioGroup
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: selected.length > 0,
        input: () => validation.current,
        element: () => element,
        focusTarget: tabStopElement,
    });
    const disabled = disabledProp || field.disabled;
    const mode = multiple ? "multiple" : "single";

    const commit = useCallback(
        (
            change: SelectionChange | null,
            reason: ChangeReason,
            event?: Event,
        ) => {
            if (change === null) {
                return;
            }
            const current = latest.current;
            const model = modelOf(current.ordered, false);
            const next = applySelection(
                model,
                { selected: current.selected, anchor: anchor.current },
                change,
                { mode, behavior: selectionBehavior },
            );
            anchor.current = next.anchor;
            if (sameSelection(next.selected, current.selected)) {
                return;
            }
            setValue(
                multiple ? [...next.selected] : (next.selected[0] ?? null),
                {
                    reason,
                    event,
                },
            );
        },
        [mode, multiple, selectionBehavior, setValue],
    );

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented) {
            return;
        }
        const items = latest.current.ordered;
        const index = items.findIndex(
            (entry) => entry.element === event.target,
        );
        if (index === -1) {
            return;
        }
        const model = modelOf(items, false);
        const elements = items.map((entry) => entry.element);
        const root = event.currentTarget;
        const result = listKeyTarget(event, model, index, {
            orientation,
            rtl: getDirection(root, direction) === "rtl",
            loop: loopFocus,
            mode,
            behavior: selectionBehavior,
            page: (from, delta) =>
                pageTarget(elements, from, delta, root, orientation),
            typeahead: (character, from) =>
                typeahead.current.match(character, model.labels, from),
        });
        if (result === null) {
            return;
        }
        event.preventDefault();
        elements[result.index]?.focus();
        commit(result.selection, "keyboard", event.nativeEvent);
    };

    const register = useCallback((entry: ListboxItemEntry) => {
        setEntries((current) => [...current, entry]);
        return () =>
            setEntries((current) => current.filter((item) => item !== entry));
    }, []);
    const focused = useCallback((item: HTMLElement) => {
        setActive(item);
        setWithin(true);
    }, []);
    const press = useCallback(
        (item: HTMLElement, event: MouseEvent) => {
            const entry = latest.current.ordered.find(
                (candidate) => candidate.element === item,
            );
            if (entry === undefined || disabled) {
                return;
            }
            item.focus();
            commit(
                listPressSelection(entry.value, event, {
                    mode,
                    behavior: selectionBehavior,
                }),
                "item-press",
                event,
            );
        },
        [disabled, mode, selectionBehavior, commit],
    );

    const reset = useRef({ defaultValue, setValue, markReset: field.reset });
    reset.current = { defaultValue, setValue, markReset: field.reset };
    useEffect(() => {
        const input = validation.current;
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const current = reset.current;
                current.markReset();
                anchor.current = null;
                current.setValue(current.defaultValue, { reason: "none" });
            },
            invalid: tabStopElement,
        });
    }, [tabStopElement]);

    const tabStop = disabled ? null : tabStopOf(ordered, selected);
    const highlighted = within && !disabled ? active : null;
    const context = useMemo(
        () => ({
            multiple,
            disabled,
            orientation,
            selected,
            tabStop,
            highlighted,
            register,
            focused,
            press,
        }),
        [
            multiple,
            disabled,
            orientation,
            selected,
            tabStop,
            highlighted,
            register,
            focused,
            press,
        ],
    );
    const fieldName = field.name ?? name;
    const state = { multiple, disabled, orientation };
    return (
        <ListboxContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...rest,
                    children: (
                        <>
                            {children}
                            <input
                                ref={validation}
                                aria-hidden="true"
                                tabIndex={-1}
                                name={multiple ? undefined : fieldName}
                                value={multiple ? "" : (selected[0] ?? "")}
                                required={
                                    multiple
                                        ? required && selected.length === 0
                                        : required
                                }
                                disabled={disabled}
                                onChange={NOOP}
                                style={VISUALLY_HIDDEN_INPUT_STYLE}
                                data-primitives-part="listbox-input"
                            />
                            {multiple && fieldName !== undefined
                                ? selected.map((key) => (
                                      <input
                                          key={key}
                                          type="hidden"
                                          name={fieldName}
                                          value={key}
                                          disabled={disabled}
                                          data-primitives-part="listbox-input"
                                      />
                                  ))
                                : null}
                        </>
                    ),
                },
                state,
                {
                    role: "listbox",
                    "aria-orientation": orientation,
                    "aria-multiselectable": multiple ? "true" : undefined,
                    "aria-required": required ? "true" : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "listbox-root",
                    ...field.attributes,
                    ...stateAttributes({ multiple, disabled, orientation }),
                    onKeyDown,
                    onFocus: field.onFocus,
                    // the focus left the list: the next Tab in lands on the selection (APG)
                    onBlur: (event: FocusEvent<HTMLElement>) => {
                        const next = event.relatedTarget;
                        if (
                            !(next instanceof Node) ||
                            !event.currentTarget.contains(next)
                        ) {
                            setWithin(false);
                            typeahead.current.reset();
                            field.onBlur();
                        }
                    },
                },
                ref,
            )}
        </ListboxContext.Provider>
    );
}
