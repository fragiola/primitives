import { createTypeahead } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    applySelection,
    createListModel,
    listKeyTarget,
    listPressSelection,
    type SelectionBehavior,
    type SelectionChange,
    sameSelection,
} from "@fragiola/primitives/selection";
import {
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import {
    useVirtualRows,
    type VirtualListProps,
} from "../../hooks/use-virtual-rows.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { mergeRefs } from "../../utils/merge-refs.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ListboxContext,
    type ListboxItemEntry,
} from "../listbox/listbox-context.ts";
import type { ListboxRootState } from "../listbox/listbox-root.tsx";

/** One option of a virtual Listbox: its value, the label typeahead matches, its disabled state. */
export interface ListboxVirtualItem {
    value: string;
    label: string;
    disabled?: boolean;
}

interface ListboxVirtualRootCommonProps
    extends Omit<PartProps<ListboxRootState>, "children">,
        VirtualListProps {
    /** Every option, in the list's order. */
    items: readonly ListboxVirtualItem[];
    /** A `Listbox.Item` for each item in view, with the item's `value` and `disabled`. */
    children: (item: ListboxVirtualItem, index: number) => ReactNode;
    /** The APG's selection model (default `"toggle"`, the recommended one). */
    selectionBehavior?: SelectionBehavior;
    /** The arrows wrap from the last option to the first and back (default `true`). */
    loopFocus?: boolean;
    /** Every option is disabled and none takes focus. */
    disabled?: boolean;
    name?: string;
    /** The form's validation fails while nothing is selected. */
    required?: boolean;
}

export interface ListboxVirtualRootSingleProps
    extends ListboxVirtualRootCommonProps {
    multiple?: false;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
}

export interface ListboxVirtualRootMultipleProps
    extends ListboxVirtualRootCommonProps {
    multiple: true;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
}

export type ListboxVirtualRootProps =
    | ListboxVirtualRootSingleProps
    | ListboxVirtualRootMultipleProps;

const NONE: readonly string[] = [];
const NOOP = () => {};
/** A virtual list is vertical (spec/virtual-lists.md). */
const orientation = "vertical" as const;

/**
 * A Listbox Root over `items`, rendering only the options in view (spec/virtual-lists.md): the
 * keys, the typeahead, the ranges and select all run over every item, a key scrolls its target
 * into view and focuses it, and the focused option and the tab stop stay rendered.
 */
export function ListboxVirtualRoot(props: ListboxVirtualRootProps) {
    const {
        items,
        children,
        multiple = false,
        value: valueProp,
        defaultValue: defaultValueProp,
        onValueChange,
        selectionBehavior = "toggle",
        loopFocus = true,
        disabled: disabledProp = false,
        name,
        required = false,
        itemSize,
        measure,
        overscan,
        loading = false,
        onLoadMore,
        ref,
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
    const [element, setElement] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [entries, setEntries] = useState<readonly ListboxItemEntry[]>([]);
    const [focusedValue, setFocusedValue] = useState<string | null>(null);
    const [within, setWithin] = useState(false);
    const anchor = useRef<string | null>(null);
    const typeahead = useRef(createTypeahead());
    const validation = useRef<HTMLInputElement>(null);
    const indexOf = useMemo(
        () => new Map(items.map((item, index) => [item.value, index])),
        [items],
    );

    // the tab stop: the focused option while the focus is inside, else the first selected, else
    // the first (APG)
    const tabStopValue =
        within && focusedValue !== null && indexOf.has(focusedValue)
            ? focusedValue
            : (items.find((item) => selected.includes(item.value))?.value ??
              items[0]?.value ??
              null);
    const pinned = useMemo(
        () =>
            [tabStopValue, focusedValue].flatMap((key) =>
                key === null ? [] : [indexOf.get(key) ?? -1],
            ),
        [tabStopValue, focusedValue, indexOf],
    );
    const virtual = useVirtualRows({
        items,
        render: children,
        pinned,
        list: element,
        itemSize,
        measure,
        overscan,
        loading,
        onLoadMore,
    });
    const { virtualizer } = virtual;
    const elementOf = (key: string | null) =>
        key === null
            ? null
            : (entries.find((entry) => entry.value === key)?.element ?? null);

    const latest = useRef({ entries, selected, tabStopValue, items, indexOf });
    latest.current = { entries, selected, tabStopValue, items, indexOf };
    const tabStopElement = useCallback(() => {
        const current = latest.current;
        return (
            current.entries.find(
                (entry) => entry.value === current.tabStopValue,
            )?.element ?? null
        );
    }, []);

    // inside a Field, the list is the field's control (spec/listbox.md, "Forms")
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
    const model = useMemo(
        () =>
            createListModel(
                items.map((item) => ({
                    key: item.value,
                    textValue: item.label,
                    disabled: item.disabled === true,
                })),
            ),
        [items],
    );

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
                { reason, event },
            );
        },
        [model, mode, multiple, selectionBehavior, setValue],
    );

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled || event.defaultPrevented) {
            return;
        }
        const current = latest.current;
        const entry = current.entries.find(
            (candidate) => candidate.element === event.target,
        );
        const index =
            entry === undefined ? -1 : (current.indexOf.get(entry.value) ?? -1);
        if (index === -1) {
            return;
        }
        const root = event.currentTarget;
        const result = listKeyTarget(event, model, index, {
            orientation,
            rtl: getDirection(root, direction) === "rtl",
            loop: loopFocus,
            mode,
            behavior: selectionBehavior,
            page: (from, delta) => virtualizer.pageIndex(from, delta),
            typeahead: (character, from) =>
                typeahead.current.match(character, model.labels, from),
        });
        if (result === null) {
            return;
        }
        event.preventDefault();
        const target = current.items[result.index];
        if (target !== undefined) {
            // the target renders within the event, in view, then takes the focus
            flushSync(() => {
                setFocusedValue(target.value);
                virtualizer.scrollToIndex(result.index);
            });
            root.querySelector<HTMLElement>(
                `[data-index="${result.index}"]`,
            )?.focus();
        }
        commit(result.selection, "keyboard", event.nativeEvent);
    };

    const register = useCallback((entry: ListboxItemEntry) => {
        setEntries((current) => [...current, entry]);
        return () =>
            setEntries((current) => current.filter((item) => item !== entry));
    }, []);
    const focused = useCallback((item: HTMLElement) => {
        const entry = latest.current.entries.find(
            (candidate) => candidate.element === item,
        );
        if (entry !== undefined) {
            setFocusedValue(entry.value);
        }
        setWithin(true);
    }, []);
    const press = useCallback(
        (item: HTMLElement, event: MouseEvent) => {
            const entry = latest.current.entries.find(
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

    const tabStop = disabled ? null : elementOf(tabStopValue);
    const highlighted = within && !disabled ? elementOf(focusedValue) : null;
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
            selected,
            tabStop,
            highlighted,
            register,
            focused,
            press,
        ],
    );
    const fieldName = field.name ?? name;
    const state = { multiple, disabled, orientation } as const;
    return (
        <ListboxContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...rest,
                    children: (
                        <>
                            {virtual.rows}
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
                    "aria-busy": loading ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "listbox-root",
                    ...field.attributes,
                    ...stateAttributes({
                        multiple,
                        disabled,
                        orientation,
                        loading,
                    }),
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
                mergeRefs(setElement, ref as Ref<HTMLElement> | undefined),
            )}
        </ListboxContext.Provider>
    );
}
