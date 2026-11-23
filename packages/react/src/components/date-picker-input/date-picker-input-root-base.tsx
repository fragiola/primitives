import { type PlainDate, today } from "@fragiola/primitives/date";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    focusOnLabelPress,
    type SegmentGranularity,
    type SegmentValues,
    segmentFormat,
    segmentValuesOf,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import type { TimeZone } from "@fragiola/primitives/time-zone";
import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import { useOverlayRoot } from "../../hooks/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type CalendarMode,
    type CalendarValue,
    isRange,
} from "../calendar/calendar-value.ts";
import { PickerBindingContext } from "../calendar/picker-binding-context.ts";
import {
    DateFieldContext,
    type DateFieldContextValue,
    type DateFieldState,
} from "../date-field/date-field-context.ts";
import type { DateFieldValue } from "../date-field/date-field-root.tsx";
import type { DateFieldSystemProps } from "../date-field/date-field-root-base.tsx";
import {
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
    type DatePickerComponent,
    DatePickerContext,
} from "../date-picker/date-picker-context.ts";
import type { DatePickerRootSharedProps } from "../date-picker/date-picker-root-base.tsx";
import {
    DateRangeFieldContext,
    type RangeEnd,
} from "../date-range-field/date-range-field-context.ts";
import {
    composeRange,
    type FieldRange,
    isRangeInvalid,
    rangeIso,
} from "../date-range-field/date-range-field-root-base.tsx";

/** The props both typed picker roots share: the picker's, and the segments' (spec/calendar.md). */
export interface DatePickerInputRootSharedProps
    extends DatePickerRootSharedProps,
        DateFieldSystemProps {
    /** `day` (the default), or `hour`, `minute`, `second`: the time is typed, the calendar chooses the date. */
    granularity?: SegmentGranularity;
    /** What a placeholder segment's first step gives, and a placeholder time a chosen date takes; default: today at midnight. */
    placeholderValue?: DateFieldValue;
    /** `12` or `24`; default: the locale's. */
    hourCycle?: 12 | 24;
}

/** A typed picker's value: a date (and time), a range of them, or `null`. */
type PickerValue = FieldValue | FieldRange | null;

const NOOP = () => {};

/** A typed picker's ISO text: the date (and time), or the interval `start/end`; empty with none. */
function pickerIso(
    granularity: SegmentGranularity,
    value: PickerValue | undefined,
    timeZone: TimeZone | undefined,
): string {
    return value == null
        ? ""
        : "start" in value
          ? rangeIso("date", granularity, value, timeZone)
          : isoOf("date", granularity, value, timeZone);
}

/** The value of each end's segments (a single date is the start's). */
function endsOf(value: PickerValue): Record<RangeEnd, FieldValue | null> {
    return value === null
        ? { start: null, end: null }
        : "start" in value
          ? value
          : { start: value, end: null };
}

/**
 * The time a chosen date takes (spec/calendar.md, "Typed input"): the typed time segments, a
 * placeholder one the placeholder's (midnight by default), a typed day period kept.
 */
function typedTime(values: SegmentValues, seed: SegmentValues) {
    let hour = values.hour ?? seed.hour ?? 0;
    if (values.hour === undefined && values.dayPeriod !== undefined) {
        hour = (hour % 12) + 12 * values.dayPeriod;
    }
    return {
        hour,
        minute: values.minute ?? seed.minute ?? 0,
        second: values.second ?? seed.second ?? 0,
        millisecond: 0,
    };
}

/**
 * The state of a DatePickerInput or a DateRangePickerInput (spec/calendar.md, "Typed input"): a
 * picker (the open state of its popup, the value its calendar binds to, its form and Field) whose
 * value is also typed into segments. The binding both ways: a typed entry sets the value only
 * when it is complete and valid, else `null`; a chosen date replaces the segments; the value the
 * segments reported coming back replaces nothing. Renders no element but the hidden input.
 */
export function DatePickerInputRootBase({
    component,
    mode,
    value: valueProp,
    defaultValue,
    onValueChange,
    min: minProp,
    max: maxProp,
    isDateUnavailable,
    locale: localeProp,
    firstDayOfWeek,
    visibleMonths,
    granularity = "day",
    placeholderValue,
    hourCycle,
    calendar,
    timeZone,
    hideTimeZone,
    disambiguation,
    name,
    required = false,
    disabled: disabledProp = false,
    readOnly = false,
    children,
    ...overlayProps
}: DatePickerInputRootSharedProps & {
    component: DatePickerComponent;
    mode: CalendarMode;
    value?: PickerValue;
    defaultValue?: PickerValue;
    onValueChange?: (value: PickerValue, details: ChangeDetails) => void;
}): ReactNode {
    const root = useOverlayRoot(overlayProps);
    const [value, setValue] = useControllableState<PickerValue, ChangeDetails>(
        valueProp,
        defaultValue ?? null,
        onValueChange,
    );
    const locale = useDocumentLocale(localeProp);
    const format = useMemo(
        () =>
            segmentFormat({
                locale,
                kind: "date",
                granularity,
                hourCycle,
                calendar,
                timeZone,
                hideTimeZone,
                disambiguation,
            }),
        [
            locale,
            granularity,
            hourCycle,
            calendar,
            timeZone,
            hideTimeZone,
            disambiguation,
        ],
    );
    // today, read once when the picker renders (as the calendars' today)
    const [todayDate] = useState(() => today());
    const placeholder: Partial<PlainDateTime> = placeholderValue ?? todayDate;
    const seed = useMemo(
        () => segmentValuesOf(format, placeholder),
        [format, placeholder],
    );
    const min = minProp ?? undefined;
    const max = maxProp ?? undefined;
    const hidden = useRef<HTMLInputElement>(null);
    const iso = (next: PickerValue | undefined) =>
        pickerIso(granularity, next, timeZone);
    // the value as of the last change, and the last one the segments reported
    const current = useRef(value);
    const reported = useRef<string | null>(null);

    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () => hidden.current,
        focusTarget: () => groups.start.firstSegment(),
    });
    const disabled = disabledProp || field.disabled;
    const invalidOf = (candidate: PickerValue): boolean =>
        candidate !== null &&
        ("start" in candidate
            ? isRangeInvalid("date", candidate, min, max, isDateUnavailable)
            : isOutOfRange("date", candidate, min, max, isDateUnavailable));
    const latest = useRef({
        mode,
        format,
        granularity,
        seed,
        defaultValue: defaultValue ?? null,
        setValue,
        invalidOf,
        reset: field.reset,
    });
    latest.current = {
        mode,
        format,
        granularity,
        seed,
        defaultValue: defaultValue ?? null,
        setValue,
        invalidOf,
        reset: field.reset,
    };
    const compose = (group: SegmentGroup) =>
        composeSegments(
            latest.current.format,
            "date",
            latest.current.granularity,
            group.values(),
        );
    const onEdit =
        (end: RangeEnd) =>
        (composed: FieldValue | null, edit: SegmentEditKind, event: Event) => {
            const state = latest.current;
            const candidate: PickerValue =
                state.mode === "single"
                    ? composed
                    : composeRange(groups, end, composed, compose);
            // the binding rule: a value only when the entry is complete and valid
            const next = state.invalidOf(candidate) ? null : candidate;
            if (iso(next) === iso(current.current)) {
                return;
            }
            reported.current = iso(next);
            current.current = next;
            state.setValue(next, { reason: editReason(edit, next), event });
        };
    const scope = () =>
        [groups.start.element, groups.end.element].filter(
            (element) => element !== null,
        );
    const groupOptions = {
        format,
        kind: "date" as const,
        granularity,
        seed,
        disabled,
        readOnly,
        groups: scope,
        onBlur: () => field.onBlur(),
    };
    const initial = endsOf(value);
    const groups: Record<RangeEnd, SegmentGroup> = {
        start: useSegmentGroup({
            ...groupOptions,
            initial: initial.start,
            onEdit: onEdit("start"),
        }),
        end: useSegmentGroup({
            ...groupOptions,
            initial: initial.end,
            onEdit: onEdit("end"),
        }),
    };
    const latestGroups = useRef(groups);
    latestGroups.current = groups;
    // a value from outside (a chosen date, a reset, the consumer's) replaces the segments; a
    // `null` one only when they are complete: the calendar never clears typed segments
    const valueIso = iso(value);
    current.current = value;
    const [synced, setSynced] = useState(valueIso);
    if (synced !== valueIso) {
        setSynced(valueIso);
        if (valueIso !== reported.current) {
            reported.current = null;
            const complete =
                groups.start.complete() &&
                (mode === "single" || groups.end.complete());
            if (value !== null || complete) {
                const next = endsOf(value);
                groups.start.replace(next.start);
                groups.end.replace(next.end);
            }
        }
    }

    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const { setOpen } = root;
    // the calendar chooses the date part: the typed time is kept (spec/calendar.md, "Typed input")
    const choose = useCallback(
        (chosen: CalendarValue) => {
            const state = latest.current;
            const withTime = (date: PlainDate, group: SegmentGroup) => {
                if (state.granularity === "day") {
                    return date;
                }
                const wall = {
                    year: date.year,
                    month: date.month,
                    day: date.day,
                    ...typedTime(group.values(), state.seed),
                };
                // a zoned picker's choice is resolved in its zone (spec/time-zones.md)
                const zone = state.format.timeZone;
                return zone
                    ? zone.resolve(
                          wall,
                          state.format.disambiguation === "reject"
                              ? "compatible"
                              : state.format.disambiguation,
                      )
                    : wall;
            };
            const next: PickerValue =
                chosen === null
                    ? null
                    : isRange(chosen)
                      ? {
                            start: withTime(
                                chosen.start,
                                latestGroups.current.start,
                            ),
                            end: withTime(chosen.end, latestGroups.current.end),
                        }
                      : withTime(chosen, latestGroups.current.start);
            state.setValue(next, { reason: "item-press" });
            setOpen(false, "item-press");
        },
        [setOpen],
    );

    // a form reset returns the value and the segments to the default; a failed validation
    // focuses the first segment
    const startFirst = groups.start.firstSegment;
    const { replace: replaceStart } = groups.start;
    const { replace: replaceEnd } = groups.end;
    const formName = field.name ?? name;
    const named = formName !== undefined;
    useEffect(() => {
        const element = hidden.current;
        if (!named || element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const state = latest.current;
                const initialValue = state.defaultValue;
                state.reset();
                reported.current = null;
                current.current = initialValue;
                const next = endsOf(initialValue);
                replaceStart(next.start);
                replaceEnd(next.end);
                state.setValue(initialValue, { reason: "none" });
                element.value = pickerIso(
                    state.granularity,
                    initialValue,
                    state.format.timeZone,
                );
            },
            invalid: startFirst,
        });
    }, [named, startFirst, replaceStart, replaceEnd]);

    // a press on the Field's label focuses the first segment (a label cannot point at a group)
    const labelId = field.aria["aria-labelledby"];
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

    const options = useMemo(
        () => ({
            min: minProp,
            max: maxProp,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
            calendar,
        }),
        [
            minProp,
            maxProp,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
            calendar,
        ],
    );
    const { open } = root;
    const calendarValue = value as CalendarValue;
    const binding = useMemo(
        () => ({ mode, open, value: calendarValue, choose, options, readOnly }),
        [mode, open, calendarValue, choose, options, readOnly],
    );
    // the Trigger: named by the label and its own content, as the picker's
    const triggerId = root.trigger?.id || root.triggerId;
    const triggerField = useMemo(
        () => ({
            ...field,
            aria: {
                ...field.aria,
                "aria-labelledby":
                    labelId === undefined
                        ? undefined
                        : `${labelId} ${triggerId}`,
            },
        }),
        [field, labelId, triggerId],
    );
    const context = useMemo(
        () => ({
            ...root,
            component,
            placed,
            setPlaced,
            field: triggerField,
            disabled,
            readOnly,
            required,
        }),
        [root, component, placed, triggerField, disabled, readOnly, required],
    );

    // the typed entry's validity: its candidate, complete but out of range, unavailable or reversed
    const startShown = composeSegments(
        format,
        "date",
        granularity,
        groups.start.rendered,
    );
    const endShown = composeSegments(
        format,
        "date",
        granularity,
        groups.end.rendered,
    );
    const candidate: PickerValue =
        mode === "single"
            ? startShown
            : startShown === null || endShown === null
              ? null
              : { start: startShown, end: endShown };
    const invalid =
        invalidOf(candidate) || field.aria["aria-invalid"] === "true";
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
        inputPart: `${component}-segments`,
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
    const start = groupContext(groups.start);
    const typed =
        mode === "single" ? (
            <DateFieldContext.Provider value={start}>
                {children}
            </DateFieldContext.Provider>
        ) : (
            <DateRangeFieldContext.Provider
                value={{ groups: { start, end: groupContext(groups.end) } }}
            >
                {children}
            </DateRangeFieldContext.Provider>
        );
    return (
        <DatePickerContext.Provider value={context}>
            <PickerBindingContext.Provider value={binding}>
                {typed}
            </PickerBindingContext.Provider>
            {formName === undefined ? null : (
                <input
                    ref={hidden}
                    aria-hidden="true"
                    tabIndex={-1}
                    name={formName}
                    value={iso(value)}
                    required={required}
                    disabled={disabled}
                    onChange={NOOP}
                    style={VISUALLY_HIDDEN_INPUT_STYLE}
                    data-primitives-part={`${component}-input`}
                />
            )}
        </DatePickerContext.Provider>
    );
}
