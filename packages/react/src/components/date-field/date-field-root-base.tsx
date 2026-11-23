import type { PlainDate } from "@fragiola/primitives/date";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    focusOnLabelPress,
    type SegmentGranularity,
    type SegmentKind,
    segmentFormat,
    segmentValuesOf,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type DateFieldComponent,
    DateFieldContext,
    type DateFieldContextValue,
    type DateFieldState,
} from "./date-field-context.ts";
import {
    boundIso,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "./field-value.ts";
import { useDocumentLocale } from "./use-document-locale.ts";
import { type SegmentEditKind, useSegmentGroup } from "./use-segment-group.ts";

export type { FieldValue } from "./field-value.ts";

/** The props DateField.Root and TimeField.Root share (spec/date-field.md, "API"). */
export interface DateFieldRootSharedProps extends PartProps<DateFieldState> {
    /** `12` or `24`; default: the locale's. */
    hourCycle?: 12 | 24;
    /** BCP 47; default: the document's `lang`, then the browser's. */
    locale?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
}

export interface DateFieldRootBaseProps<Value extends FieldValue>
    extends DateFieldRootSharedProps {
    component: DateFieldComponent;
    kind: SegmentKind;
    granularity: SegmentGranularity;
    value: Value | null | undefined;
    defaultValue: Value | null;
    onValueChange:
        | ((value: Value | null, details: ChangeDetails) => void)
        | undefined;
    placeholderValue: Partial<PlainDateTime>;
    min: Value | undefined;
    max: Value | undefined;
    isDateUnavailable?: ((date: PlainDate) => boolean) | undefined;
}

const NOOP = () => {};

/** The change reason of an edit (spec/date-field.md, "API"): `null` after an erase clears. */
export function editReason(
    edit: SegmentEditKind,
    value: unknown,
): ChangeReason {
    return edit === "step"
        ? "keyboard"
        : edit === "erase" && value === null
          ? "input-clear"
          : "input-change";
}

/**
 * The state of a DateField or TimeField (spec/date-field.md): one group of segments
 * (`useSegmentGroup`), the value (complete segments only), its validity and its hidden form
 * input. The segment editing itself is the toolkit's `/segments`.
 */
export function DateFieldRootBase<Value extends FieldValue>({
    component,
    kind,
    granularity,
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholderValue,
    min,
    max,
    isDateUnavailable,
    hourCycle,
    locale: localeProp,
    required = false,
    readOnly = false,
    disabled: disabledProp = false,
    name,
    children,
    ...props
}: DateFieldRootBaseProps<Value>) {
    const [value, setOwnValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const locale = useDocumentLocale(localeProp);
    const format = useMemo(
        () => segmentFormat({ locale, kind, granularity, hourCycle }),
        [locale, kind, granularity, hourCycle],
    );
    const seed = useMemo(
        () => segmentValuesOf(format, placeholderValue),
        [format, placeholderValue],
    );
    const hidden = useRef<HTMLInputElement>(null);
    // the value as of the last change, and the last one the segments reported (it coming back
    // changes nothing: the typing goes on)
    const current = useRef(value);
    const reported = useRef<string | null>(null);
    const latest = useRef({
        kind,
        granularity,
        defaultValue,
        setOwnValue,
        reset: () => {},
    });
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () => hidden.current,
        focusTarget: () => group.firstSegment(),
    });
    const disabled = disabledProp || field.disabled;
    const group = useSegmentGroup({
        format,
        kind,
        granularity,
        seed,
        initial: value,
        disabled,
        readOnly,
        onEdit: (composed, edit, event) => {
            const state = latest.current;
            const after = isoOf(state.kind, state.granularity, composed);
            if (
                after === isoOf(state.kind, state.granularity, current.current)
            ) {
                return;
            }
            reported.current = after;
            current.current = composed as Value | null;
            state.setOwnValue(composed as Value | null, {
                reason: editReason(edit, composed),
                event,
            });
        },
        onBlur: () => field.onBlur(),
    });
    const iso = isoOf(kind, granularity, value);
    // a value given from outside (or reported back) replaces the segments; a `null` one only
    // when they are complete, so a partly typed field keeps what it holds
    const [synced, setSynced] = useState(iso);
    current.current = value;
    if (synced !== iso) {
        setSynced(iso);
        if (iso !== reported.current) {
            reported.current = null;
            if (value !== null || group.complete()) {
                group.replace(value);
            }
        }
    }
    const labelId = field.aria["aria-labelledby"];
    const invalid =
        (value !== null &&
            isOutOfRange(kind, value, min, max, isDateUnavailable)) ||
        field.aria["aria-invalid"] === "true";
    latest.current = {
        kind,
        granularity,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    };

    // a form reset returns it to its default, and writes the rendered value back (NumberField's)
    const { element: input, firstSegment, replace } = group;
    useEffect(() => {
        const element = hidden.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const state = latest.current;
                state.reset();
                reported.current = null;
                current.current = state.defaultValue;
                replace(state.defaultValue);
                state.setOwnValue(state.defaultValue, { reason: "none" });
                element.value = isoOf(
                    state.kind,
                    state.granularity,
                    state.defaultValue,
                );
            },
            invalid: firstSegment,
        });
    }, [firstSegment, replace]);

    // a press on the Field's label focuses the first segment (a label cannot point at a group)
    useEffect(() => {
        if (labelId === undefined || input === null) {
            return undefined;
        }
        const label = input.ownerDocument.getElementById(labelId);
        return label === null
            ? undefined
            : focusOnLabelPress(label, firstSegment);
    }, [labelId, input, firstSegment]);

    const state: DateFieldState = { disabled, readOnly, required, invalid };
    const attributes = {
        ...field.attributes,
        ...stateAttributes({
            disabled,
            readonly: readOnly,
            required,
            invalid,
        }),
    };
    const context: DateFieldContextValue = {
        ...state,
        component,
        format,
        segments: group.segments,
        labelId,
        field,
        attributes,
        setInputElement: group.setElement,
        onSegmentKey: group.onSegmentKey,
        onSegmentText: group.onSegmentText,
        onSegmentBlur: group.onSegmentBlur,
    };
    const formName = field.name ?? name;
    return (
        <DateFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": `${component}-root`,
                ...attributes,
            })}
            <input
                ref={hidden}
                type={
                    kind === "time"
                        ? "time"
                        : granularity === "day"
                          ? "date"
                          : "datetime-local"
                }
                aria-hidden="true"
                tabIndex={-1}
                name={formName}
                value={iso}
                min={boundIso(kind, granularity, min)}
                max={boundIso(kind, granularity, max)}
                step="any"
                required={required}
                disabled={disabled}
                onChange={NOOP}
                onFocus={() => firstSegment()?.focus()}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part={`${component}-hidden-input`}
            />
        </DateFieldContext.Provider>
    );
}
