import { getDirection } from "@fragiola/primitives/direction";
import { ratingKeyTarget } from "@fragiola/primitives/range";
import {
    type FocusEvent,
    type ReactNode,
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
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { RatingContext } from "./rating-context.ts";

export interface RatingRootState {
    value: number;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** What the Root's children function receives (spec/rating.md, "API"). */
export interface RatingRootRenderState {
    /** The stars' indexes, `1` to `count`. */
    items: number[];
    value: number;
}

export interface RatingRootProps
    extends Omit<PartProps<RatingRootState>, "children"> {
    /** The score, `0` for none (controlled). */
    value?: number;
    /** The score at first (default `0`: none). */
    defaultValue?: number;
    onValueChange?: (value: number, details: ChangeDetails) => void;
    /** The number of stars (default `5`). */
    count?: number;
    /** Half steps: the arrows step by 0.5, a press on a star's inline-start half chooses its half. */
    allowHalf?: boolean;
    /** A press that chooses the current value again clears it (default `false`). */
    allowClear?: boolean;
    /** Shown and focusable; nothing changes it. */
    readOnly?: boolean;
    /** Every star is disabled. */
    disabled?: boolean;
    /** The form's validation fails while the value is `0`. */
    required?: boolean;
    /** The HiddenInput's name. */
    name?: string;
    /** The arrows wrap from `count` to the first step and back (default `true`). */
    loopFocus?: boolean;
    children?: ReactNode | ((state: RatingRootRenderState) => ReactNode);
}

/**
 * A score chosen among stars (spec/rating.md, the APG's rating radio group): the `radiogroup`,
 * one `radio` per star, one tab stop, the arrows step the value and move the focus, a pointer
 * previews the value it would choose.
 */
export function RatingRoot({
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    count = 5,
    allowHalf = false,
    allowClear = false,
    readOnly = false,
    disabled: disabledProp = false,
    required = false,
    name,
    loopFocus = true,
    children,
    ...props
}: RatingRootProps) {
    const [value, setValue] = useControllableState<number, ChangeDetails>(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const [element, ref] = useElement<HTMLElement>();
    const direction = useContext(DirectionContext);
    const [hovered, setHovered] = useState<number | null>(null);
    const stars = useRef(new Map<number, HTMLElement>());
    const hiddenInput = useRef<HTMLInputElement | null>(null);
    const latest = useRef({ value });
    latest.current = { value };

    const tabStopElement = useCallback(() => {
        const current = latest.current.value;
        return stars.current.get(current > 0 ? Math.ceil(current) : 1) ?? null;
    }, []);
    // inside a Field, the Root is the field's control (spec/field.md, "Integration contract"), as
    // RadioGroup; the validated element is the HiddenInput
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value > 0,
        input: () => hiddenInput.current,
        element: () => element,
        focusTarget: tabStopElement,
    });
    const disabled = disabledProp || field.disabled;
    const interactive = !disabled && !readOnly;

    const choose = useCallback(
        (next: number, reason: ChangeReason, event: Event) =>
            setValue(next, { reason, event }),
        [setValue],
    );
    const preview = useCallback(
        (next: number | null) => setHovered(interactive ? next : null),
        [interactive],
    );
    const keyDown = useCallback(
        (key: string, index: number, event: Event) => {
            if (!interactive || element === null) {
                return false;
            }
            const current = latest.current.value;
            if (key === " ") {
                // checks the focused star, when it is not checked (spec/rating.md, "Keyboard")
                if (Math.ceil(current) !== index || current <= 0) {
                    choose(index, "keyboard", event);
                }
                return true;
            }
            const target = ratingKeyTarget(key, current, {
                count,
                allowHalf,
                rtl: getDirection(element, direction) === "rtl",
                loop: loopFocus,
            });
            if (target === null) {
                return false;
            }
            stars.current.get(Math.ceil(target))?.focus();
            choose(target, "keyboard", event);
            return true;
        },
        [interactive, element, count, allowHalf, direction, loopFocus, choose],
    );
    const registerItem = useCallback((index: number, star: HTMLElement) => {
        stars.current.set(index, star);
        return () => {
            if (stars.current.get(index) === star) {
                stars.current.delete(index);
            }
        };
    }, []);
    const setHiddenInput = useCallback((input: HTMLInputElement | null) => {
        hiddenInput.current = input;
    }, []);
    const { reset: markReset } = field;
    const reset = useCallback(() => {
        markReset();
        setValue(defaultValue, { reason: "none" });
    }, [defaultValue, setValue, markReset]);

    const displayed = interactive && hovered !== null ? hovered : value;
    const tabStop = disabled ? null : value > 0 ? Math.ceil(value) : 1;
    const context = useMemo(
        () => ({
            value,
            displayed,
            count,
            allowHalf,
            allowClear,
            disabled,
            readOnly,
            required,
            name: field.name ?? name,
            tabStop,
            choose,
            preview,
            keyDown,
            registerItem,
            setHiddenInput,
            reset,
            tabStopElement,
        }),
        [
            value,
            displayed,
            count,
            allowHalf,
            allowClear,
            disabled,
            readOnly,
            required,
            field.name,
            name,
            tabStop,
            choose,
            preview,
            keyDown,
            registerItem,
            setHiddenInput,
            reset,
            tabStopElement,
        ],
    );
    const items = useMemo(
        () => Array.from({ length: count }, (_, index) => index + 1),
        [count],
    );
    const state = { value, disabled, readOnly, required };
    return (
        <RatingContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children:
                        typeof children === "function"
                            ? children({ items, value })
                            : children,
                },
                state,
                {
                    role: "radiogroup",
                    "aria-readonly": readOnly ? "true" : undefined,
                    "aria-disabled": disabled ? "true" : undefined,
                    "aria-required": required ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "rating-root",
                    ...field.attributes,
                    ...stateAttributes({
                        disabled,
                        readonly: readOnly,
                        required,
                    }),
                    // the preview ends when the pointer leaves the stars' Root
                    onPointerLeave: () => setHovered(null),
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
        </RatingContext.Provider>
    );
}
