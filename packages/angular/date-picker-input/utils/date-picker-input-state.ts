import {
    afterRenderEffect,
    computed,
    DestroyRef,
    DOCUMENT,
    ElementRef,
    effect,
    inject,
    PLATFORM_ID,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import {
    type PlainDate,
    watchDocumentLanguage,
} from "@fragiola/primitives/date";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    focusOnLabelPress,
    type SegmentGranularity,
    type SegmentValues,
    segmentFormat,
    segmentValuesOf,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import type { TimeZone } from "@fragiola/primitives/time-zone";
import type {
    CalendarMode,
    CalendarValue,
    PickerBinding,
} from "@fragiola/primitives-angular/calendar";
import {
    type DateFieldData,
    type DateFieldState,
    type DateFieldSystemInputs,
    documentLocale,
    editReason,
    type FieldValue,
    isOutOfRange,
    isoOf,
    type SegmentEditKind,
    SegmentGroup,
    stateData,
    systemFormat,
} from "@fragiola/primitives-angular/date-field";
import type {
    DatePickerComponent,
    DatePickerInputs,
    DatePickerState,
} from "@fragiola/primitives-angular/date-picker";
import {
    composeRange,
    type FieldRange,
    isRangeInvalid,
    type RangeEnd,
    type RangeGroups,
    rangeIso,
} from "@fragiola/primitives-angular/date-range-field";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    createOverlayRoot,
    injectFlush,
    type OpenChangeEvent,
    placementSignal,
} from "@fragiola/primitives-angular/internal";

/** A typed picker's value: a date (and time), a range of them, or `null`. */
export type PickerValue = FieldValue | FieldRange | null;

/** The inputs a typed picker root hands its state: the picker's, and the segments'. */
export interface DatePickerInputInputs extends DatePickerInputs {
    granularity: Signal<SegmentGranularity>;
    /** What a placeholder segment's first step gives, and a placeholder time a chosen date takes. */
    placeholderValue: Signal<Partial<PlainDateTime>>;
    hourCycle: Signal<12 | 24 | undefined>;
    /** The calendar system and time zone of its segments (spec/calendar-systems.md, spec/time-zones.md). */
    system: DateFieldSystemInputs;
}

/** A typed picker's ISO text: the date (and time), or the interval `start/end`; empty with none. */
function pickerIso(
    granularity: SegmentGranularity,
    value: PickerValue,
    timeZone: TimeZone | undefined,
): string {
    return value === null
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
 * value is also typed into segments, bound both ways: a typed entry sets the value only when it
 * is complete and valid, else `null`; a chosen date replaces the segments; the value the segments
 * reported coming back replaces nothing. The picker's parts read it as a `DatePickerState`;
 * DateField's (and the range field's) parts read its groups. Created in a root directive's
 * injection context.
 */
export class DatePickerInputState implements RangeGroups {
    private readonly flush = injectFlush();
    private readonly document = inject(DOCUMENT);
    private readonly browser = inject(PLATFORM_ID) === "browser";
    private readonly language = signal(0);
    private readonly own = controllable<PickerValue, ChangeDetails>(
        this.inputs.value as Signal<PickerValue | undefined>,
        this.inputs.valueChange as { emit: (value: PickerValue) => void },
        () => (this.inputs.defaultValue() as PickerValue | undefined) ?? null,
        (value, details) => this.emitValue(value, details),
    );
    readonly value = this.own.value;
    private readonly locale = computed(() => {
        const own = this.inputs.options().locale;
        if (own !== undefined) {
            return own;
        }
        this.language();
        return documentLocale(this.document, this.browser);
    });
    private readonly format = computed(() =>
        segmentFormat({
            locale: this.locale(),
            kind: "date",
            granularity: this.inputs.granularity(),
            hourCycle: this.inputs.hourCycle(),
            ...systemFormat(this.inputs.system),
        }),
    );
    private readonly seed = computed(() =>
        segmentValuesOf(this.format(), this.inputs.placeholderValue()),
    );
    private readonly iso = computed(() =>
        pickerIso(
            this.inputs.granularity(),
            this.value(),
            this.inputs.system.timeZone(),
        ),
    );
    /** What the picker's parts read (`DATE_PICKER`). */
    readonly picker: DatePickerState;
    readonly state: Signal<DateFieldState>;
    readonly data: Signal<DateFieldData>;
    private readonly start: SegmentGroup;
    private readonly end: SegmentGroup;
    private reported: string | null = null;

    constructor(
        readonly component: DatePickerComponent,
        readonly mode: CalendarMode,
        private readonly inputs: DatePickerInputInputs,
        emitOpen: (event: OpenChangeEvent) => void,
        private readonly emitValue: (
            value: PickerValue,
            details: ChangeDetails,
        ) => void,
    ) {
        const overlay = createOverlayRoot(
            inputs,
            emitOpen,
            `primitives-${component}`,
        );
        const field = fieldControl({
            id: computed(() => undefined),
            labelable: false,
            value: this.value,
            filled: computed(() => this.value() !== null),
            // read after the render, once the hidden input below exists
            input: () => (untracked(named) ? hidden : null),
            focusTarget: () => this.start.firstSegment(),
        });
        const name = computed(() => field.name() ?? inputs.name());
        const named = computed(() => name() !== undefined);
        const hidden = createHiddenInput(
            inject(ElementRef).nativeElement,
            { type: "text", "data-primitives-part": `${component}-input` },
            named,
        );
        const disabled = computed(() => inputs.disabled() || field.disabled());
        const readOnly = computed(() => inputs.readOnly());
        const required = computed(() => inputs.required());
        const min = computed(() => inputs.options().min ?? undefined);
        const max = computed(() => inputs.options().max ?? undefined);
        const invalidOf = (candidate: PickerValue): boolean => {
            const unavailable = untracked(inputs.options).isDateUnavailable;
            return (
                candidate !== null &&
                ("start" in candidate
                    ? isRangeInvalid(
                          "date",
                          candidate,
                          untracked(min),
                          untracked(max),
                          unavailable,
                      )
                    : isOutOfRange(
                          "date",
                          candidate,
                          untracked(min),
                          untracked(max),
                          unavailable,
                      ))
            );
        };
        // the typed entry's validity: complete, and out of range, unavailable or reversed
        const invalid = computed(() => {
            inputs.options();
            const start = this.start.composed();
            const candidate =
                mode === "single"
                    ? start
                    : composeRange(start, this.end.composed());
            return invalidOf(candidate) || field.ariaInvalid() === "true";
        });
        this.state = computed(() => ({
            disabled: disabled(),
            readOnly: readOnly(),
            required: required(),
            invalid: invalid(),
        }));
        this.data = stateData(this.state, field);
        const owner = (end: RangeEnd) => ({
            component,
            inputPart: `${component}-segments`,
            kind: "date" as const,
            format: this.format,
            granularity: inputs.granularity,
            seed: this.seed,
            state: this.state,
            data: this.data,
            disabled,
            readOnly,
            required,
            invalid,
            field,
            labelledBy: field.labelledBy,
            groups: () =>
                [
                    untracked(this.start.inputElement),
                    untracked(this.end.inputElement),
                ].filter((element) => element !== null),
            onEdit: (
                composed: FieldValue | null,
                edit: SegmentEditKind,
                event: Event,
            ) => {
                const candidate =
                    mode === "single"
                        ? composed
                        : end === "start"
                          ? composeRange(composed, untracked(this.end.composed))
                          : composeRange(
                                untracked(this.start.composed),
                                composed,
                            );
                // the binding rule: a value only when the entry is complete and valid
                const next = invalidOf(candidate) ? null : candidate;
                const after = pickerIso(
                    untracked(inputs.granularity),
                    next,
                    untracked(inputs.system.timeZone),
                );
                if (after === untracked(this.iso)) {
                    return;
                }
                this.reported = after;
                this.own.set(next, { reason: editReason(edit, next), event });
            },
            onBlur: () => field.blurred(),
            flush: () => this.flush(),
        });
        this.start = new SegmentGroup(
            owner("start"),
            computed(() => endsOf(this.value()).start),
        );
        this.end = new SegmentGroup(
            owner("end"),
            computed(() => endsOf(this.value()).end),
        );

        // a value from outside (a chosen date, a reset, the consumer's) replaces the segments; a
        // `null` one only when they are complete: the calendar never clears typed segments
        let synced: string | null = null;
        effect(() => {
            const iso = this.iso();
            untracked(() => {
                if (synced === null || synced === iso) {
                    synced = iso;
                    return;
                }
                synced = iso;
                if (iso === this.reported) {
                    return;
                }
                this.reported = null;
                const value = this.value();
                const complete =
                    this.start.complete() &&
                    (mode === "single" || this.end.complete());
                if (value !== null || complete) {
                    const next = endsOf(value);
                    this.start.replace(next.start);
                    this.end.replace(next.end);
                }
            });
        });

        // the calendar chooses the date part: the typed time is kept
        const choose = (chosen: CalendarValue) => {
            if (untracked(readOnly)) {
                return;
            }
            const day = untracked(inputs.granularity) === "day";
            const seed = untracked(this.seed);
            const format = untracked(this.format);
            const withTime = (date: PlainDate, group: SegmentGroup) => {
                if (day) {
                    return date;
                }
                const wall = {
                    year: date.year,
                    month: date.month,
                    day: date.day,
                    ...typedTime(untracked(group.values), seed),
                };
                // a zoned picker's choice is resolved in its zone (its hook, spec/time-zones.md)
                return (
                    format.timeZone?.choose(wall, format.disambiguation) ?? wall
                );
            };
            const next: PickerValue =
                chosen === null
                    ? null
                    : "start" in chosen
                      ? {
                            start: withTime(chosen.start, this.start),
                            end: withTime(chosen.end, this.end),
                        }
                      : withTime(chosen, this.start);
            this.own.set(next, { reason: "item-press" });
            overlay.setOpen(false, "item-press");
        };
        const binding: PickerBinding = {
            mode,
            value: this.value as Signal<CalendarValue>,
            options: inputs.options,
            open: overlay.open,
            readOnly,
            choose,
        };
        // the Trigger: named by the label and its own content, as the picker's
        const triggerField = {
            ...field,
            labelledBy: computed(() => {
                const label = field.labelledBy();
                return label === null ? null : `${label} ${overlay.triggerId}`;
            }),
        };
        this.picker = {
            component,
            mode,
            overlay,
            value: this.value as Signal<CalendarValue>,
            options: inputs.options,
            binding,
            placed: placementSignal({ side: "bottom", align: "start" }),
            state: computed(() => ({ open: overlay.open() })),
            disabled,
            readOnly,
            required,
            field: triggerField,
            trigger: computed(() => ({
                open: overlay.open(),
                disabled: disabled(),
                readonly: readOnly(),
                required: required(),
            })),
            choose,
            part: (part: string) => `${component}-${part}`,
        };

        effect(() => {
            hidden.value = this.iso();
            const formName = name();
            if (formName === undefined) {
                hidden.removeAttribute("name");
            } else {
                hidden.setAttribute("name", formName);
            }
            hidden.required = required();
            hidden.disabled = disabled();
        });
        // bridged to its form while it is in the page (after the write phase that inserts it)
        afterRenderEffect({
            read: (onCleanup) => {
                if (!named()) {
                    return;
                }
                untracked(() => {
                    onCleanup(
                        bridgeForm(hidden, {
                            reset: () => {
                                this.reset(field.reset);
                                // the browser reset the input after the state: write it back
                                hidden.value = untracked(this.iso);
                            },
                            invalid: () => this.start.firstSegment(),
                        }),
                    );
                });
            },
        });

        // a press on the Field's label focuses the first segment
        afterRenderEffect((onCleanup) => {
            const labelId = field.labelledBy();
            const input = this.start.inputElement();
            if (labelId === null || input === null) {
                return;
            }
            const label = input.ownerDocument.getElementById(labelId);
            if (label !== null) {
                onCleanup(
                    focusOnLabelPress(label, () => this.start.firstSegment()),
                );
            }
        });

        if (this.browser) {
            inject(DestroyRef).onDestroy(
                watchDocumentLanguage(this.document, () =>
                    this.language.update((count) => count + 1),
                ),
            );
        }
    }

    /** One end's group of segments (a single picker's is the start's). */
    group(end: RangeEnd): SegmentGroup {
        return end === "start" ? this.start : this.end;
    }

    private reset(fieldReset: () => void): void {
        fieldReset();
        this.reported = null;
        const initial =
            (untracked(this.inputs.defaultValue) as PickerValue | undefined) ??
            null;
        const next = endsOf(initial);
        this.start.replace(next.start);
        this.end.replace(next.end);
        this.own.set(initial, { reason: "none" });
        this.flush();
    }
}
