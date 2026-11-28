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
    computed,
    defineComponent,
    Fragment,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    type FieldControlBinding,
    useFieldControl,
} from "../../composables/use-field-control.ts";
import { useOverlayRoot } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type CalendarMode,
    type CalendarValue,
    isRange,
} from "../calendar/calendar-value.ts";
import { PickerBindingKey } from "../calendar/picker-binding-context.ts";
import {
    type DateFieldContext,
    DateFieldKey,
    type DateFieldState,
} from "../date-field/date-field-context.ts";
import type { DateFieldValue } from "../date-field/date-field-root.ts";
import {
    type DateFieldSystemProps,
    dateFieldSystemProps,
} from "../date-field/date-field-root-base.ts";
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
    DatePickerKey,
} from "../date-picker/date-picker-context.ts";
import {
    type DatePickerRootSharedProps,
    datePickerRootEmits,
    datePickerRootProps,
} from "../date-picker/date-picker-root-base.ts";
import {
    DateRangeFieldKey,
    type RangeEnd,
} from "../date-range-field/date-range-field-context.ts";
import {
    composeRange,
    type FieldRange,
    isRangeInvalid,
    rangeIso,
} from "../date-range-field/date-range-field-root-base.ts";

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

/** The props of a typed picker's root: the picker's, and the segments'. */
export const datePickerInputRootProps = {
    ...datePickerRootProps,
    value: { type: Object as PropType<PickerValue>, default: undefined },
    defaultValue: { type: Object as PropType<PickerValue>, default: null },
    granularity: {
        type: String as PropType<SegmentGranularity>,
        default: "day",
    },
    placeholderValue: {
        type: Object as PropType<DateFieldValue>,
        default: undefined,
    },
    hourCycle: { type: Number as PropType<12 | 24>, default: undefined },
    ...dateFieldSystemProps,
};

/**
 * The state of a DatePickerInput or a DateRangePickerInput (spec/calendar.md, "Typed input"): a
 * picker (the open state of its popup, the value its calendar binds to, its form and Field) whose
 * value is also typed into segments. The binding both ways: a typed entry sets the value only
 * when it is complete and valid, else `null`; a chosen date replaces the segments; the value the
 * segments reported coming back replaces nothing. Renders no element but the hidden input.
 */
export function defineDatePickerInputRoot(
    name: string,
    component: DatePickerComponent,
    mode: CalendarMode,
) {
    return defineComponent({
        name,
        props: datePickerInputRootProps,
        emits: datePickerRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const own = useControllable<PickerValue, ChangeDetails>(
                () => props.value,
                props.defaultValue ?? null,
                (next, details) => {
                    emit("update:value", next as CalendarValue);
                    emit("valueChange", next as CalendarValue, details);
                },
            );
            const localeOf = useDocumentLocale(() => props.locale);
            const format = computed(() =>
                segmentFormat({
                    locale: localeOf(),
                    kind: "date",
                    granularity: props.granularity,
                    hourCycle: props.hourCycle,
                    calendar: props.calendar,
                    timeZone: props.timeZone,
                    hideTimeZone: props.hideTimeZone,
                    disambiguation: props.disambiguation,
                }),
            );
            // today, read once when the picker renders (as the calendars' today)
            const todayDate = today();
            const seed = computed(() =>
                segmentValuesOf(
                    format.value,
                    (props.placeholderValue ??
                        todayDate) as Partial<PlainDateTime>,
                ),
            );
            const min = () => props.min ?? undefined;
            const max = () => props.max ?? undefined;
            const iso = computed(() =>
                pickerIso(props.granularity, own.value.value, props.timeZone),
            );
            // the last value the segments reported, and the value as of the last change
            let reported: string | null = null;
            let current = own.value.value;
            const hidden = shallowRef<HTMLInputElement | null>(null);
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => own.value.value,
                filled: () => own.value.value !== null,
                input: () => hidden.value,
                focusTarget: () => groups.start.firstSegment(),
            });
            const disabled = () => props.disabled || field.disabled();
            const readOnly = () => props.readOnly;
            const labelId = () => field.aria()["aria-labelledby"];
            const invalidOf = (candidate: PickerValue): boolean =>
                candidate !== null &&
                ("start" in candidate
                    ? isRangeInvalid(
                          "date",
                          candidate,
                          min(),
                          max(),
                          props.isDateUnavailable,
                      )
                    : isOutOfRange(
                          "date",
                          candidate,
                          min(),
                          max(),
                          props.isDateUnavailable,
                      ));
            const setValue = (next: PickerValue, details: ChangeDetails) => {
                current = next;
                own.set(next, details);
                setTimeout(() => {
                    current = own.value.value;
                });
            };
            const compose = (group: SegmentGroup) =>
                composeSegments(
                    format.value,
                    "date",
                    props.granularity,
                    group.values.value,
                );
            const onEdit =
                (end: RangeEnd) =>
                (
                    composed: FieldValue | null,
                    edit: SegmentEditKind,
                    event: Event,
                ) => {
                    const candidate: PickerValue =
                        mode === "single"
                            ? composed
                            : composeRange(groups, end, composed, compose);
                    // the binding rule: a value only when the entry is complete and valid
                    const next = invalidOf(candidate) ? null : candidate;
                    const after = pickerIso(
                        props.granularity,
                        next,
                        props.timeZone,
                    );
                    if (
                        after ===
                        pickerIso(props.granularity, current, props.timeZone)
                    ) {
                        return;
                    }
                    reported = after;
                    setValue(next, { reason: editReason(edit, next), event });
                };
            const scope = () =>
                [groups.start.element.value, groups.end.element.value].filter(
                    (element) => element !== null,
                );
            const groupOptions = {
                format: () => format.value,
                kind: "date" as const,
                granularity: () => props.granularity,
                seed: () => seed.value,
                disabled,
                readOnly,
                groups: scope,
                onBlur: () => field.onBlur(),
            };
            const initial = endsOf(own.value.value);
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
            // a value from outside (a chosen date, a reset, the consumer's) replaces the
            // segments; a `null` one only when they are complete: the calendar never clears
            // typed segments
            watch(
                iso,
                (next) => {
                    current = own.value.value;
                    if (next === reported) {
                        return;
                    }
                    reported = null;
                    const value = own.value.value;
                    const complete =
                        groups.start.complete() &&
                        (mode === "single" || groups.end.complete());
                    if (value !== null || complete) {
                        const ends = endsOf(value);
                        groups.start.replace(ends.start);
                        groups.end.replace(ends.end);
                    }
                },
                { flush: "sync" },
            );

            // the Trigger: named by the label and its own content, as the picker's
            const triggerField: FieldControlBinding = {
                ...field,
                aria: () => {
                    const label = labelId();
                    const triggerId = root.trigger.value?.id || root.triggerId;
                    return {
                        ...field.aria(),
                        "aria-labelledby":
                            label === undefined
                                ? undefined
                                : `${label} ${triggerId}`,
                    };
                },
            };
            // whether the popup is a layer: its calendar takes the focus only then
            // (spec/calendar.md, "Focus")
            const layered = ref(false);
            provide(DatePickerKey, {
                layered,
                ...root,
                component,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
                field: triggerField,
                disabled,
                readOnly,
                required: () => props.required,
            });
            // the calendar chooses the date part: the typed time is kept
            const withTime = (date: PlainDate, group: SegmentGroup) => {
                if (props.granularity === "day") {
                    return date;
                }
                const wall = {
                    year: date.year,
                    month: date.month,
                    day: date.day,
                    ...typedTime(group.values.value, seed.value),
                };
                // a zoned picker's choice is resolved in its zone (its hook, spec/time-zones.md)
                return (
                    format.value.timeZone?.choose(
                        wall,
                        format.value.disambiguation,
                    ) ?? wall
                );
            };
            provide(PickerBindingKey, {
                mode,
                open: () => root.open.value,
                layered: () => layered.value,
                value: computed(() => own.value.value as CalendarValue),
                choose(chosen) {
                    if (readOnly()) {
                        return;
                    }
                    const next: PickerValue =
                        chosen === null
                            ? null
                            : isRange(chosen)
                              ? {
                                    start: withTime(chosen.start, groups.start),
                                    end: withTime(chosen.end, groups.end),
                                }
                              : withTime(chosen, groups.start);
                    setValue(next, { reason: "item-press" });
                    root.setOpen(false, "item-press");
                },
                options: () => ({
                    min: props.min,
                    max: props.max,
                    isDateUnavailable: props.isDateUnavailable,
                    locale: localeOf(),
                    firstDayOfWeek: props.firstDayOfWeek,
                    visibleMonths: props.visibleMonths,
                    calendar: props.calendar,
                }),
                readOnly,
            });

            // the typed entry's validity: its candidate, complete but out of range, unavailable
            // or reversed
            const state = computed<DateFieldState>(() => {
                const start = compose(groups.start);
                const end = compose(groups.end);
                const candidate: PickerValue =
                    mode === "single"
                        ? start
                        : start === null || end === null
                          ? null
                          : { start, end };
                return {
                    disabled: disabled(),
                    readOnly: props.readOnly,
                    required: props.required,
                    invalid:
                        invalidOf(candidate) ||
                        field.aria()["aria-invalid"] === "true",
                };
            });
            const attributes = () => {
                const { disabled, readOnly, required, invalid } = state.value;
                return {
                    ...field.attributes(),
                    ...stateAttributes({
                        disabled,
                        readonly: readOnly,
                        required,
                        invalid,
                    }),
                };
            };
            const groupContext = (group: SegmentGroup): DateFieldContext => ({
                component,
                inputPart: `${component}-segments`,
                state,
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
            if (mode === "single") {
                provide(DateFieldKey, start);
            } else {
                provide(DateRangeFieldKey, {
                    groups: { start, end: groupContext(groups.end) },
                });
            }

            // a form reset returns the value and the segments to the default; a failed
            // validation focuses the first segment
            watch(
                hidden,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                const initialValue = props.defaultValue ?? null;
                                field.reset();
                                reported = null;
                                const ends = endsOf(initialValue);
                                groups.start.replace(ends.start);
                                groups.end.replace(ends.end);
                                setValue(initialValue, { reason: "none" });
                                element.value = pickerIso(
                                    props.granularity,
                                    own.value.value,
                                    props.timeZone,
                                );
                            },
                            invalid: groups.start.firstSegment,
                        }),
                    );
                },
                { flush: "post" },
            );

            // a press on the Field's label focuses the first segment
            watch(
                [labelId, groups.start.element],
                ([id, input], _, onCleanup) => {
                    if (id === undefined || input === null) {
                        return;
                    }
                    const label = input.ownerDocument.getElementById(id);
                    if (label !== null) {
                        onCleanup(
                            focusOnLabelPress(label, groups.start.firstSegment),
                        );
                    }
                },
                { flush: "post" },
            );

            return () => {
                const submitted = field.name() ?? props.name;
                return h(Fragment, [
                    slots.default?.(),
                    submitted === undefined
                        ? null
                        : h("input", {
                              ref: (element: unknown) => {
                                  hidden.value =
                                      element as HTMLInputElement | null;
                              },
                              "aria-hidden": "true",
                              tabindex: -1,
                              name: submitted,
                              value: iso.value,
                              required: props.required,
                              disabled: disabled(),
                              style: VISUALLY_HIDDEN_INPUT_STYLE,
                              "data-primitives-part": `${component}-input`,
                          }),
                ]);
            };
        },
    });
}
