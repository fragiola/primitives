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
import type { TimeZone } from "@fragiola/primitives/time-zone";
import { useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type {
    DateFieldComponent,
    DateFieldContextValue,
    DateFieldState,
} from "../date-field/date-field-context.ts";
import type { DateFieldSystemProps } from "../date-field/date-field-root-base.tsx";
import {
    boundIso,
    compareValues,
    composeSegments,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "../date-field/field-value.ts";
import { useDocumentLocale } from "../date-field/use-document-locale.ts";
import {
    editReason,
    type SegmentEditKind,
    type SegmentGroup,
    useSegmentGroup,
} from "../date-field/use-segment-group.ts";
import {
    DateRangeFieldContext,
    type RangeEnd,
} from "./date-range-field-context.ts";

/** A range of field values: two dates, two dates and times, or two times. */
export interface FieldRange<Value extends FieldValue = FieldValue> {
    readonly start: Value;
    readonly end: Value;
}

/** The props DateRangeField.Root and TimeRangeField.Root share (spec/date-range-field.md, "API"). */
export interface DateRangeFieldRootSharedProps
    extends PartProps<DateFieldState> {
    /** `12` or `24`; default: the locale's. */
    hourCycle?: 12 | 24;
    /** BCP 47; default: the document's `lang`, then the browser's. */
    locale?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    /** The start's hidden input name. */
    startName?: string;
    /** The end's hidden input name. */
    endName?: string;
}

export interface DateRangeFieldRootBaseProps<Value extends FieldValue>
    extends DateRangeFieldRootSharedProps,
        DateFieldSystemProps {
    component: DateFieldComponent;
    kind: SegmentKind;
    granularity: SegmentGranularity;
    value: FieldRange<Value> | null | undefined;
    defaultValue: FieldRange<Value> | null;
    onValueChange:
        | ((value: FieldRange<Value> | null, details: ChangeDetails) => void)
        | undefined;
    placeholderValue: Partial<PlainDateTime>;
    min: Value | undefined;
    max: Value | undefined;
    isDateUnavailable?: ((date: PlainDate) => boolean) | undefined;
}

const NOOP = () => {};

/** A range's ISO text (`start/end`), empty with none: what the reports compare. */
export function rangeIso(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    range: FieldRange | null | undefined,
    timeZone?: TimeZone,
): string {
    return range == null
        ? ""
        : `${isoOf(kind, granularity, range.start, timeZone)}/${isoOf(kind, granularity, range.end, timeZone)}`;
}

/**
 * Whether a range is invalid (spec/date-range-field.md, "Validation"): an end out of range or
 * unavailable, or the end before the start.
 */
export function isRangeInvalid(
    kind: SegmentKind,
    range: FieldRange,
    min: FieldValue | undefined,
    max: FieldValue | undefined,
    isDateUnavailable: ((date: PlainDate) => boolean) | undefined,
): boolean {
    return (
        isOutOfRange(kind, range.start, min, max, isDateUnavailable) ||
        isOutOfRange(kind, range.end, min, max, isDateUnavailable) ||
        compareValues(kind, range.end, range.start) < 0
    );
}

/** The range both groups make (`null` while either is incomplete), after `changed` made `composed`. */
export function composeRange(
    groups: Readonly<Record<RangeEnd, SegmentGroup>>,
    changed: RangeEnd,
    composed: FieldValue | null,
    compose: (group: SegmentGroup) => FieldValue | null,
): FieldRange | null {
    const other = compose(groups[changed === "start" ? "end" : "start"]);
    if (composed === null || other === null) {
        return null;
    }
    return changed === "start"
        ? { start: composed, end: other }
        : { start: other, end: composed };
}

/** The earlier (`edge` -1) or later (1) of two optional values. */
function edgeOf(
    kind: SegmentKind,
    a: FieldValue | undefined,
    b: FieldValue | undefined,
    edge: -1 | 1,
): FieldValue | undefined {
    if (a === undefined || b === undefined) {
        return a ?? b;
    }
    return Math.sign(compareValues(kind, a, b)) === edge ? a : b;
}

/**
 * The state of a DateRangeField or TimeRangeField (spec/date-range-field.md): two groups of
 * segments, the start's and the end's, one value (both complete), its validity and its two
 * hidden form inputs.
 */
export function DateRangeFieldRootBase<Value extends FieldValue>({
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
    calendar,
    timeZone,
    hideTimeZone,
    disambiguation,
    locale: localeProp,
    required = false,
    readOnly = false,
    disabled: disabledProp = false,
    startName,
    endName,
    children,
    ...props
}: DateRangeFieldRootBaseProps<Value>) {
    const [value, setOwnValue] = useControllableState<
        FieldRange | null,
        ChangeDetails
    >(
        valueProp,
        defaultValue,
        onValueChange as
            | ((value: FieldRange | null, details: ChangeDetails) => void)
            | undefined,
    );
    const locale = useDocumentLocale(localeProp);
    const format = useMemo(
        () =>
            segmentFormat({
                locale,
                kind,
                granularity,
                hourCycle,
                calendar,
                timeZone,
                hideTimeZone,
                disambiguation,
            }),
        [
            locale,
            kind,
            granularity,
            hourCycle,
            calendar,
            timeZone,
            hideTimeZone,
            disambiguation,
        ],
    );
    const seed = useMemo(
        () => segmentValuesOf(format, placeholderValue),
        [format, placeholderValue],
    );
    const hiddenStart = useRef<HTMLInputElement>(null);
    const hiddenEnd = useRef<HTMLInputElement>(null);
    // the value as of the last change, and the last one the segments reported (spec/date-field.md)
    const current = useRef(value);
    const reported = useRef<string | null>(null);
    const latest = useRef({
        format,
        kind,
        granularity,
        defaultValue: defaultValue as FieldRange | null,
        setOwnValue,
        reset: () => {},
    });

    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        // the hidden input of the first end that fails the validation, else the start's
        input: () =>
            [hiddenStart.current, hiddenEnd.current].find(
                (input) => input !== null && !input.validity.valid,
            ) ?? hiddenStart.current,
        focusTarget: () => groups.start.firstSegment(),
    });
    const disabled = disabledProp || field.disabled;
    const scope = () =>
        [groups.start.element, groups.end.element].filter(
            (element) => element !== null,
        );
    const onEdit =
        (end: RangeEnd) =>
        (composed: FieldValue | null, edit: SegmentEditKind, event: Event) => {
            const state = latest.current;
            const next = composeRange(groups, end, composed, (group) =>
                composeSegments(
                    state.format,
                    state.kind,
                    state.granularity,
                    group.values(),
                ),
            );
            const after = rangeIso(
                state.kind,
                state.granularity,
                next,
                state.format.timeZone,
            );
            if (
                after ===
                rangeIso(
                    state.kind,
                    state.granularity,
                    current.current,
                    state.format.timeZone,
                )
            ) {
                return;
            }
            reported.current = after;
            current.current = next;
            state.setOwnValue(next, {
                reason: editReason(edit, next),
                event,
            });
        };
    const groupOptions = {
        format,
        kind,
        granularity,
        seed,
        disabled,
        readOnly,
        groups: scope,
        onBlur: () => field.onBlur(),
    };
    const groups: Record<RangeEnd, SegmentGroup> = {
        start: useSegmentGroup({
            ...groupOptions,
            initial: value?.start ?? null,
            onEdit: onEdit("start"),
        }),
        end: useSegmentGroup({
            ...groupOptions,
            initial: value?.end ?? null,
            onEdit: onEdit("end"),
        }),
    };
    const iso = rangeIso(kind, granularity, value, timeZone);
    // a value from outside replaces both ends; a `null` one only when they are complete
    current.current = value;
    const [synced, setSynced] = useState(iso);
    if (synced !== iso) {
        setSynced(iso);
        if (iso !== reported.current) {
            reported.current = null;
            if (
                value !== null ||
                (groups.start.complete() && groups.end.complete())
            ) {
                groups.start.replace(value?.start ?? null);
                groups.end.replace(value?.end ?? null);
            }
        }
    }
    latest.current = {
        format,
        kind,
        granularity,
        defaultValue: defaultValue as FieldRange | null,
        setOwnValue,
        reset: field.reset,
    };
    const labelId = field.aria["aria-labelledby"];
    const invalid =
        (value !== null &&
            isRangeInvalid(kind, value, min, max, isDateUnavailable)) ||
        field.aria["aria-invalid"] === "true";

    // a form reset returns both ends to the default (the start's input bridges it); a failed
    // validation focuses the first segment of the end that fails it
    const startFirst = groups.start.firstSegment;
    const endFirst = groups.end.firstSegment;
    const { replace: replaceStart } = groups.start;
    const { replace: replaceEnd } = groups.end;
    useEffect(() => {
        const start = hiddenStart.current;
        const end = hiddenEnd.current;
        if (start === null || end === null) {
            return undefined;
        }
        const stopStart = bridgeForm(start, {
            reset: () => {
                const state = latest.current;
                const initial = state.defaultValue;
                state.reset();
                reported.current = null;
                current.current = initial;
                replaceStart(initial?.start ?? null);
                replaceEnd(initial?.end ?? null);
                state.setOwnValue(initial, { reason: "none" });
                start.value = isoOf(
                    state.kind,
                    state.granularity,
                    initial?.start,
                    state.format.timeZone,
                );
                end.value = isoOf(
                    state.kind,
                    state.granularity,
                    initial?.end,
                    state.format.timeZone,
                );
            },
            invalid: startFirst,
        });
        const stopEnd = bridgeForm(end, { invalid: endFirst });
        return () => {
            stopStart();
            stopEnd();
        };
    }, [startFirst, endFirst, replaceStart, replaceEnd]);

    // a press on the Field's label focuses the start's first segment
    const startElement = groups.start.element;
    useEffect(() => {
        if (labelId === undefined || startElement === null) {
            return undefined;
        }
        const label = startElement.ownerDocument.getElementById(labelId);
        return label === null
            ? undefined
            : focusOnLabelPress(label, startFirst);
    }, [labelId, startElement, startFirst]);

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
    const groupContext = (group: SegmentGroup): DateFieldContextValue => ({
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
    });
    const context = {
        groups: {
            start: groupContext(groups.start),
            end: groupContext(groups.end),
        },
    };
    const type = timeZone
        ? "text"
        : kind === "time"
          ? "time"
          : granularity === "day"
            ? "date"
            : "datetime-local";
    const hiddenInput = (
        end: RangeEnd,
        ref: typeof hiddenStart,
        name: string | undefined,
        lower: FieldValue | undefined,
        upper: FieldValue | undefined,
    ) => (
        <input
            ref={ref}
            type={type}
            aria-hidden="true"
            tabIndex={-1}
            name={name}
            value={isoOf(kind, granularity, value?.[end], timeZone)}
            min={boundIso(kind, granularity, lower)}
            max={boundIso(kind, granularity, upper)}
            step="any"
            required={required}
            disabled={disabled}
            onChange={NOOP}
            onFocus={() => groups[end].firstSegment()?.focus()}
            style={VISUALLY_HIDDEN_INPUT_STYLE}
            data-primitives-part={`${component}-hidden-input`}
            data-range={end}
        />
    );
    return (
        <DateRangeFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": `${component}-root`,
                ...attributes,
            })}
            {hiddenInput(
                "start",
                hiddenStart,
                startName,
                min,
                edgeOf(kind, max, value?.end, -1),
            )}
            {hiddenInput(
                "end",
                hiddenEnd,
                endName,
                edgeOf(kind, min, value?.start, 1),
                max,
            )}
        </DateRangeFieldContext.Provider>
    );
}
