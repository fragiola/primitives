import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    DOCUMENT,
    effect,
    InjectionToken,
    inject,
    type OutputEmitterRef,
    PLATFORM_ID,
    type Signal,
    signal,
    untracked,
    type WritableSignal,
} from "@angular/core";
import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import {
    type PlainDate,
    watchDocumentLanguage,
} from "@fragiola/primitives/date";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    type DateSegment,
    focusOnLabelPress,
    type SegmentGranularity,
    type SegmentKind,
    segmentFormat,
    segmentValuesOf,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import type { Disambiguation, TimeZone } from "@fragiola/primitives/time-zone";
import {
    type FieldControlBinding,
    fieldControl,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    dataValues,
    injectFlush,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";
import { documentLocale } from "./document-locale.ts";
import {
    boundIso,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "./field-value.ts";
import {
    type DateFieldData,
    type DateFieldParts,
    type DateFieldState,
    editReason,
    SegmentGroup,
} from "./segment-group.ts";

export type { DateFieldData, DateFieldParts, DateFieldState };

/** The state attributes of every part: the field's own (`state`) and its Field's. */
export function stateData(
    state: Signal<DateFieldState>,
    field: FieldControlBinding,
): Signal<DateFieldData> {
    return computed(() => {
        const current = state();
        const own = dataValues({
            disabled: current.disabled,
            readonly: current.readOnly,
            required: current.required,
            invalid: current.invalid,
        });
        const fieldData = field.data();
        return {
            ...own,
            valid: fieldData.valid,
            dirty: fieldData.dirty,
            touched: fieldData.touched,
            filled: fieldData.filled,
            focused: fieldData.focused,
        };
    });
}

/**
 * Which root the shared parts sit in: their part attribute names it (spec/date-field.md; the
 * range fields' and the pickers' typed input, spec/date-range-field.md and spec/calendar.md).
 */
export type DateFieldComponent =
    | "date-field"
    | "time-field"
    | "date-range-field"
    | "time-range-field"
    | "date-picker"
    | "date-range-picker";

/** A Segment's state: the field's, with its own type and placeholder state. */
export interface DateFieldSegmentState extends DateFieldState {
    type: DateSegment["type"];
    placeholder: boolean;
}

/**
 * The calendar system and time zone a date field takes (spec/calendar-systems.md,
 * spec/time-zones.md): DateField, DateRangeField and the typed pickers; TimeField and
 * TimeRangeField have none.
 */
export interface DateFieldSystemInputs {
    /** A calendar system: the segments show and edit its fields; values stay ISO. */
    calendar: Signal<CalendarSystem | undefined>;
    /** A time zone: the values are `ZonedDateTime`s in it. */
    timeZone: Signal<TimeZone | undefined>;
    /** Hides the zone's name segment. */
    hideTimeZone: Signal<boolean>;
    /** How a wall time the zone skips or repeats resolves (default `compatible`). */
    disambiguation: Signal<Disambiguation | undefined>;
}

/** The segment format options of a field's calendar system and time zone (none without them). */
export function systemFormat(system: DateFieldSystemInputs | undefined) {
    return system === undefined
        ? {}
        : {
              calendar: system.calendar(),
              timeZone: system.timeZone(),
              hideTimeZone: system.hideTimeZone(),
              disambiguation: system.disambiguation(),
          };
}

/** The hidden input's type: a zoned value's text (`…-05:00[America/New_York]`) is no native date's. */
export function hiddenType(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    timeZone: TimeZone | undefined,
): string {
    return timeZone
        ? "text"
        : kind === "time"
          ? "time"
          : granularity === "day"
            ? "date"
            : "datetime-local";
}

/** The inputs a DateField or TimeField root hands its state (spec/date-field.md, "API"). */
export interface DateFieldInputs {
    value: Signal<FieldValue | null | undefined>;
    valueChange: Pick<OutputEmitterRef<FieldValue | null>, "emit">;
    defaultValue: Signal<FieldValue | null>;
    granularity: Signal<SegmentGranularity>;
    /** What a placeholder segment's first step gives. */
    placeholderValue: Signal<Partial<PlainDateTime>>;
    min: Signal<FieldValue | null | undefined>;
    max: Signal<FieldValue | null | undefined>;
    isDateUnavailable: Signal<((date: PlainDate) => boolean) | undefined>;
    hourCycle: Signal<12 | 24 | undefined>;
    locale: Signal<string | undefined>;
    required: Signal<boolean>;
    readOnly: Signal<boolean>;
    disabled: Signal<boolean>;
    name: Signal<string | undefined>;
    /** A DateField's calendar system and time zone (a TimeField has none). */
    system?: DateFieldSystemInputs;
}

/**
 * The enclosing group of segments, for the Input and Segment directives: a DateField's or
 * TimeField's root state, or one end of a range field or a typed picker.
 */
export const DATE_FIELD = new InjectionToken<DateFieldParts>("DATE_FIELD");

/**
 * The state of a DateField or TimeField (spec/date-field.md): one group of segments
 * (`SegmentGroup`), the value (complete segments only), its validity and its hidden form input,
 * rendered right after the root. The segment editing itself is the toolkit's `/segments`. Created
 * in a root directive's injection context.
 */
export class DateFieldRootState implements DateFieldParts {
    private readonly flush = injectFlush();
    private readonly document = inject(DOCUMENT);
    // `"browser"` or `"server"` (`isPlatformBrowser` lives in @angular/common, not a peer)
    private readonly browser = inject(PLATFORM_ID) === "browser";
    /** Bumped by a change of the document's `lang` in the browser (followed after mount). */
    private readonly language = signal(0);
    private readonly own = controllable<FieldValue | null, ChangeDetails>(
        this.inputs.value,
        this.inputs.valueChange,
        () => this.inputs.defaultValue(),
        (value, details) => this.emit(value, details),
    );
    /** The value: complete segments, or `null`. */
    readonly value = this.own.value;
    readonly locale = computed(() => {
        const own = this.inputs.locale();
        if (own !== undefined) {
            return own;
        }
        this.language();
        return documentLocale(this.document, this.browser);
    });
    readonly format = computed(() =>
        segmentFormat({
            locale: this.locale(),
            kind: this.kind,
            granularity: this.inputs.granularity(),
            hourCycle: this.inputs.hourCycle(),
            ...systemFormat(this.inputs.system),
        }),
    );
    /** The time zone the values are in (spec/time-zones.md), if any. */
    private readonly timeZone = () => this.inputs.system?.timeZone();
    private readonly seed = computed(() =>
        segmentValuesOf(this.format(), this.inputs.placeholderValue()),
    );
    /** The value's ISO text (the hidden input's value). */
    readonly iso = computed(() =>
        isoOf(
            this.kind,
            this.inputs.granularity(),
            this.value(),
            this.timeZone(),
        ),
    );
    readonly field: FieldControlBinding;
    readonly disabled: Signal<boolean>;
    readonly readOnly: Signal<boolean>;
    readonly required: Signal<boolean>;
    /** Out of range or unavailable, or the Field shows an error. */
    readonly invalid: Signal<boolean>;
    readonly state: Signal<DateFieldState>;
    /** The state attributes and the field's, for every part. */
    readonly data: Signal<DateFieldData>;
    readonly labelledBy: Signal<string | null>;
    /** The segments: the one group of a single field. */
    private readonly group: SegmentGroup;
    readonly segments: Signal<DateSegment[]>;
    readonly inputElement: WritableSignal<HTMLElement | null>;
    /** The ISO text the segments reported last: it coming back changes nothing (the typing goes on). */
    private reported: string | null = null;

    constructor(
        /** The part attribute's prefix of its parts (`date-field-segment`, `time-field-segment`). */
        readonly component: DateFieldComponent,
        readonly kind: SegmentKind,
        private readonly inputs: DateFieldInputs,
        private readonly emit: (
            value: FieldValue | null,
            details: ChangeDetails,
        ) => void,
        anchor: HTMLElement,
    ) {
        const hidden = createHiddenInput(anchor, {
            type: kind === "time" ? "time" : "date",
            step: "any",
            "data-primitives-part": `${component}-hidden-input`,
        });
        this.field = fieldControl({
            id: computed(() => undefined),
            labelable: false,
            value: this.value,
            filled: computed(() => this.value() !== null),
            input: () => hidden,
            focusTarget: () => this.firstSegment(),
        });
        const field = this.field;
        this.labelledBy = field.labelledBy;
        this.disabled = computed(
            () => this.inputs.disabled() || field.disabled(),
        );
        this.readOnly = computed(() => this.inputs.readOnly());
        this.required = computed(() => this.inputs.required());
        this.invalid = computed(() => {
            const value = this.value();
            const own =
                value !== null &&
                isOutOfRange(
                    kind,
                    value,
                    this.inputs.min(),
                    this.inputs.max(),
                    this.inputs.isDateUnavailable(),
                );
            return own || field.ariaInvalid() === "true";
        });
        this.state = computed(() => ({
            disabled: this.disabled(),
            readOnly: this.readOnly(),
            required: this.required(),
            invalid: this.invalid(),
        }));
        this.data = stateData(this.state, field);
        this.group = new SegmentGroup(
            {
                component,
                kind,
                format: this.format,
                granularity: this.inputs.granularity,
                seed: this.seed,
                state: this.state,
                data: this.data,
                disabled: this.disabled,
                readOnly: this.readOnly,
                required: this.required,
                invalid: this.invalid,
                field,
                labelledBy: this.labelledBy,
                onEdit: (composed, edit, event) => {
                    const granularity = untracked(this.inputs.granularity);
                    const after = isoOf(
                        kind,
                        granularity,
                        composed,
                        untracked(this.timeZone),
                    );
                    if (after === untracked(this.iso)) {
                        return;
                    }
                    this.reported = after;
                    this.own.set(composed, {
                        reason: editReason(edit, composed),
                        event,
                    });
                },
                onBlur: () => field.blurred(),
                flush: () => this.flush(),
            },
            this.value,
        );
        this.segments = this.group.segments;
        this.inputElement = this.group.inputElement;

        // a value given from outside (or reported back) replaces the segments; a `null` one only
        // when they are complete, so a partly typed field keeps what it holds
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
                if (value !== null || this.group.complete()) {
                    this.group.replace(value);
                }
            });
        });

        const formName = computed(
            () => field.name() ?? this.inputs.name() ?? null,
        );
        effect(() => {
            const granularity = this.inputs.granularity();
            // the type first: a value is read in the type it is set in
            hidden.type = hiddenType(kind, granularity, this.timeZone());
            setInputAttribute(hidden, "name", formName());
            setInputAttribute(
                hidden,
                "min",
                boundIso(kind, granularity, this.inputs.min()),
            );
            setInputAttribute(
                hidden,
                "max",
                boundIso(kind, granularity, this.inputs.max()),
            );
            hidden.value = this.iso();
            hidden.required = this.required();
            hidden.disabled = this.disabled();
        });
        const onHiddenFocus = () => this.firstSegment()?.focus();
        hidden.addEventListener("focus", onHiddenFocus);

        const destroyRef = inject(DestroyRef);
        if (this.browser) {
            destroyRef.onDestroy(
                watchDocumentLanguage(this.document, () =>
                    this.language.update((count) => count + 1),
                ),
            );
        }

        // a form reset returns it to its default, and writes the rendered value back (NumberField's)
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(hidden, {
                reset: () => {
                    this.reset();
                    hidden.value = untracked(this.iso);
                },
                invalid: () => this.firstSegment(),
            });
        });

        // a press on the Field's label focuses the first segment (a label cannot point at a group)
        afterRenderEffect((onCleanup) => {
            const labelId = field.labelledBy();
            const input = this.inputElement();
            if (labelId === null || input === null) {
                return;
            }
            const label = input.ownerDocument.getElementById(labelId);
            if (label !== null) {
                onCleanup(focusOnLabelPress(label, () => this.firstSegment()));
            }
        });

        destroyRef.onDestroy(() => {
            stop?.();
            hidden.removeEventListener("focus", onHiddenFocus);
        });
    }

    /** The part attribute of one of its parts. */
    part(name: string): string {
        return `${this.component}-${name}`;
    }

    /** The first focusable segment. */
    firstSegment(): HTMLElement | null {
        return this.group.firstSegment();
    }

    segmentKey(
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ): boolean {
        return this.group.segmentKey(segment, event, element);
    }

    segmentText(
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ): void {
        this.group.segmentText(segment, text, event, element);
    }

    segmentBlur(segment: DateSegment, event: FocusEvent): void {
        this.group.segmentBlur(segment, event);
    }

    private reset(): void {
        this.field.reset();
        this.reported = null;
        const defaultValue = untracked(this.inputs.defaultValue);
        this.group.replace(defaultValue);
        this.own.set(defaultValue, { reason: "none" });
        this.flush();
    }
}
