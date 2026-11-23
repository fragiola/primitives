import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type FocusEvent,
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
import {
    SegmentedControlContext,
    type SegmentedControlItemEntry,
} from "./segmented-control-context.ts";

export interface SegmentedControlRootState {
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: "horizontal" | "vertical";
}

export interface SegmentedControlRootProps
    extends PartProps<SegmentedControlRootState> {
    /** The checked Item's value; `null` for none (controlled). */
    value?: string | null;
    /** The Item checked at first (default: none). */
    defaultValue?: string | null;
    /** The checked Item's value; `null` when a form reset returns the control to none. */
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
    /** Disables every Item. */
    disabled?: boolean;
    /** The form's validation fails while no Item is checked. */
    required?: boolean;
    /** The hidden input's name. */
    name?: string;
    /** `aria-orientation` and `data-orientation` (default `"horizontal"`); it changes no key. */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last Item to the first and back (default `true`). */
    loopFocus?: boolean;
}

const NOOP = () => {};

/** The Items in document order. */
function inOrder(
    entries: readonly SegmentedControlItemEntry[],
): SegmentedControlItemEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The Item holding the tab stop: the checked one when enabled, else the first enabled one. */
function tabStopOf(
    entries: readonly SegmentedControlItemEntry[],
    value: string | null,
): SegmentedControlItemEntry | undefined {
    const enabled = inOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A single choice among segments, with an Indicator that follows the checked one
 * (spec/segmented-control.md, the APG radio group): the `radiogroup`, one tab stop, the arrows
 * move the focus and the check together, and a hidden input for native forms.
 */
export function SegmentedControlRoot({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    disabled: disabledProp = false,
    required = false,
    name,
    orientation = "horizontal",
    loopFocus = true,
    children,
    ...props
}: SegmentedControlRootProps) {
    const [value, setValue] = useControllableState<
        string | null,
        ChangeDetails
    >(valueProp, defaultValue, onValueChange);
    const [element, ref] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [items, setItems] = useState<readonly SegmentedControlItemEntry[]>(
        [],
    );
    const input = useRef<HTMLInputElement>(null);
    const latest = useRef({ items, value });
    latest.current = { items, value };

    const tabStopElement = useCallback(() => {
        const current = latest.current;
        return tabStopOf(current.items, current.value)?.element ?? null;
    }, []);
    // inside a Field, the Root is the field's control (spec/field.md, "Integration contract"), as
    // RadioGroup: no labelable element; the validated element is the hidden input
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () => input.current,
        element: () => element,
        focusTarget: tabStopElement,
    });
    const disabled = disabledProp || field.disabled;

    const select = useCallback(
        (next: string, reason: ChangeReason, event: Event) =>
            setValue(next, { reason, event }),
        [setValue],
    );
    const navigate = useCallback(
        (key: string, from: HTMLElement, event: Event) => {
            const ordered = inOrder(latest.current.items);
            const index = ordered.findIndex((entry) => entry.element === from);
            if (index === -1 || element === null) {
                return false;
            }
            const target = radioKeyTarget(key, index, ordered.length, {
                rtl: getDirection(element, direction) === "rtl",
                loop: loopFocus,
                skip: (candidate) => ordered[candidate]?.disabled ?? true,
            });
            const entry = target === null ? undefined : ordered[target];
            if (entry === undefined) {
                return false;
            }
            entry.element.focus();
            select(entry.value, "keyboard", event);
            return true;
        },
        [element, direction, loopFocus, select],
    );
    const register = useCallback((entry: SegmentedControlItemEntry) => {
        setItems((current) => [...current, entry]);
        return () =>
            setItems((current) => current.filter((item) => item !== entry));
    }, []);

    // a form reset returns the control to its default (spec/segmented-control.md, "Forms")
    const reset = useRef({ defaultValue, setValue, markReset: field.reset });
    reset.current = { defaultValue, setValue, markReset: field.reset };
    useEffect(() => {
        const hidden = input.current;
        if (hidden === null) {
            return undefined;
        }
        return bridgeForm(hidden, {
            reset: () => {
                const current = reset.current;
                current.markReset();
                current.setValue(current.defaultValue, { reason: "none" });
                // the browser reset the input to its mount-time default: write the rendered value
                // back (a render that changes it patches it again)
                hidden.value = latest.current.value ?? "";
            },
            invalid: tabStopElement,
        });
    }, [tabStopElement]);

    // before the Items registered (on a server), only a checked Item holds the tab stop
    const tabStop = disabled
        ? null
        : items.length === 0
          ? value
          : (tabStopOf(items, value)?.value ?? null);
    const checkedElement =
        value === null
            ? null
            : (items.find((entry) => entry.value === value)?.element ?? null);
    const context = useMemo(
        () => ({
            value,
            disabled,
            orientation,
            tabStop,
            root: element,
            checkedElement,
            select,
            navigate,
            register,
        }),
        [
            value,
            disabled,
            orientation,
            tabStop,
            element,
            checkedElement,
            select,
            navigate,
            register,
        ],
    );
    const fieldName = field.name ?? name;
    const state = { value, disabled, required, orientation };
    return (
        <SegmentedControlContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {children}
                            <input
                                ref={input}
                                aria-hidden="true"
                                tabIndex={-1}
                                name={value === null ? undefined : fieldName}
                                value={value ?? ""}
                                required={required}
                                disabled={disabled}
                                onChange={NOOP}
                                style={VISUALLY_HIDDEN_INPUT_STYLE}
                                data-primitives-part="segmented-control-input"
                            />
                        </>
                    ),
                },
                state,
                {
                    role: "radiogroup",
                    "aria-orientation": orientation,
                    "aria-required": required ? "true" : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "segmented-control-root",
                    ...field.attributes,
                    ...stateAttributes({ disabled, required, orientation }),
                    // focus within the Root; touched once focus leaves it
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
        </SegmentedControlContext.Provider>
    );
}
