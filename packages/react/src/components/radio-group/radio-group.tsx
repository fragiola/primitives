import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type FocusEvent,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type RadioEntry, RadioGroupContext } from "./radio-group-context.ts";

export interface RadioGroupState {
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: "horizontal" | "vertical" | undefined;
}

export interface RadioGroupProps extends PartProps<RadioGroupState> {
    /** The checked radio's value; `null` for none (controlled). */
    value?: string | null;
    /** The radio checked at first (default: none). */
    defaultValue?: string | null;
    /** The checked radio's value; `null` when a form reset returns the group to none. */
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
    /** Disables every radio. */
    disabled?: boolean;
    /** The form's validation fails while no radio is checked. */
    required?: boolean;
    /** Every radio's hidden input takes it. */
    name?: string;
    /** `aria-orientation` and `data-orientation`; it changes no key (APG). */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last radio to the first and back (default `true`). */
    loopFocus?: boolean;
}

/** The radios in document order. */
function inOrder(entries: readonly RadioEntry[]): RadioEntry[] {
    return [...entries].sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
    );
}

/** The radio holding the tab stop: the checked one when enabled, else the first enabled one. */
function tabStopOf(
    entries: readonly RadioEntry[],
    value: string | null,
): RadioEntry | undefined {
    const enabled = inOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A set of radios of which one can be checked (spec/radio-group.md, the APG radio group): the
 * `radiogroup`, one tab stop, the arrows move the focus and the check together.
 */
export function RadioGroup({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    disabled: disabledProp = false,
    required = false,
    name,
    orientation,
    loopFocus = true,
    ...props
}: RadioGroupProps) {
    const [value, setValue] = useControllableState<
        string | null,
        ChangeDetails
    >(valueProp, defaultValue, onValueChange);
    const [element, ref] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [radios, setRadios] = useState<readonly RadioEntry[]>([]);
    const latest = useRef({ radios, value });
    latest.current = { radios, value };

    const tabStopElement = useCallback(() => {
        const current = latest.current;
        const entry = tabStopOf(current.radios, current.value);
        return entry?.element ?? null;
    }, []);
    // inside a Field, the group is the field's control (spec/field.md, "Integration contract"):
    // no labelable element; the validated element is its first enabled radio's hidden input
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () =>
            element?.querySelector<HTMLInputElement>(
                'input[data-primitives-part="radio-input"]:not([disabled])',
            ) ?? null,
        element: () => element,
        focusTarget: tabStopElement,
    });
    const disabled = disabledProp || field.disabled;

    const select = useCallback(
        (next: string) => setValue(next, { reason: "none" }),
        [setValue],
    );
    const navigate = useCallback(
        (key: string, from: HTMLElement) => {
            const ordered = inOrder(latest.current.radios);
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
            select(entry.value);
            return true;
        },
        [element, direction, loopFocus, select],
    );
    const { reset: markReset } = field;
    // every radio's hidden input reports its form's reset: the group resets once per reset
    const resetting = useRef(false);
    const reset = useCallback(() => {
        if (resetting.current) {
            return;
        }
        resetting.current = true;
        setTimeout(() => {
            resetting.current = false;
        });
        markReset();
        setValue(defaultValue, { reason: "none" });
    }, [defaultValue, setValue, markReset]);
    const register = useCallback((entry: RadioEntry) => {
        setRadios((current) => [...current, entry]);
        return () =>
            setRadios((current) => current.filter((item) => item !== entry));
    }, []);

    const tabStop =
        radios.length === 0 ? value : (tabStopOf(radios, value)?.value ?? null);
    const context = useMemo(
        () => ({
            value,
            disabled,
            required,
            name: field.name ?? name,
            tabStop,
            select,
            navigate,
            reset,
            tabStopElement,
            register,
        }),
        [
            value,
            disabled,
            required,
            name,
            field.name,
            tabStop,
            select,
            navigate,
            reset,
            tabStopElement,
            register,
        ],
    );
    const state = { value, disabled, required, orientation };
    return (
        <RadioGroupContext.Provider value={context}>
            {renderElement(
                "div",
                props,
                state,
                {
                    role: "radiogroup",
                    "aria-required": required ? "true" : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    "aria-orientation": orientation,
                    ...field.aria,
                    "data-primitives-part": "radio-group-root",
                    ...field.attributes,
                    ...stateAttributes({ disabled, required, orientation }),
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
        </RadioGroupContext.Provider>
    );
}
