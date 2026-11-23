import {
    afterNextRender,
    afterRenderEffect,
    computed,
    DestroyRef,
    DOCUMENT,
    effect,
    inject,
    type OutputEmitterRef,
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
    type SegmentKind,
    segmentFormat,
    segmentValuesOf,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import {
    boundIso,
    type DateFieldComponent,
    type DateFieldData,
    type DateFieldState,
    type DateFieldSystemInputs,
    documentLocale,
    editReason,
    type FieldValue,
    hiddenType,
    isoOf,
    type SegmentEditKind,
    SegmentGroup,
    stateData,
    systemFormat,
} from "@fragiola/primitives-angular/date-field";
import {
    type FieldControlBinding,
    fieldControl,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    injectFlush,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";
import {
    composeRange,
    edgeOf,
    type FieldRange,
    isRangeInvalid,
    type RangeEnd,
    rangeIso,
} from "./field-range.ts";
import type { RangeGroups } from "./range-end-parts.ts";

/** The inputs a DateRangeField or TimeRangeField root hands its state (spec/date-range-field.md). */
export interface DateRangeFieldInputs {
    value: Signal<FieldRange | null | undefined>;
    valueChange: Pick<OutputEmitterRef<FieldRange | null>, "emit">;
    defaultValue: Signal<FieldRange | null>;
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
    startName: Signal<string | undefined>;
    endName: Signal<string | undefined>;
    /** A DateRangeField's calendar system and time zone (a TimeRangeField has none). */
    system?: DateFieldSystemInputs;
}

/**
 * The state of a DateRangeField or TimeRangeField (spec/date-range-field.md): two groups of
 * segments, the start's and the end's, one value (both complete), its validity and its two hidden
 * form inputs, rendered right after the root. Created in a root directive's injection context.
 */
export class DateRangeFieldRootState implements RangeGroups {
    private readonly flush = injectFlush();
    private readonly document = inject(DOCUMENT);
    private readonly browser = inject(PLATFORM_ID) === "browser";
    private readonly language = signal(0);
    private readonly own = controllable<FieldRange | null, ChangeDetails>(
        this.inputs.value,
        this.inputs.valueChange,
        () => this.inputs.defaultValue(),
        (value, details) => this.emit(value, details),
    );
    /** The value: both ends complete, or `null`. */
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
    private readonly timeZone = computed(() => this.inputs.system?.timeZone());
    private readonly seed = computed(() =>
        segmentValuesOf(this.format(), this.inputs.placeholderValue()),
    );
    /** The value's ISO text, `start/end`. */
    readonly iso = computed(() =>
        rangeIso(
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
    /** An end out of range or unavailable, the end before the start, or the Field's error. */
    readonly invalid: Signal<boolean>;
    readonly state: Signal<DateFieldState>;
    readonly data: Signal<DateFieldData>;
    private readonly start: SegmentGroup;
    private readonly end: SegmentGroup;
    private reported: string | null = null;

    constructor(
        readonly component: DateFieldComponent,
        readonly kind: SegmentKind,
        private readonly inputs: DateRangeFieldInputs,
        private readonly emit: (
            value: FieldRange | null,
            details: ChangeDetails,
        ) => void,
        anchor: HTMLElement,
    ) {
        const hiddenInput = (end: RangeEnd, at: Node) =>
            createHiddenInput(at, {
                type: kind === "time" ? "time" : "date",
                step: "any",
                "data-primitives-part": `${component}-hidden-input`,
                "data-range": end,
            });
        const hiddenStart = hiddenInput("start", anchor);
        // the end's right after the start's (inserted after it, in the same render)
        const hiddenEnd = hiddenInput("end", hiddenStart);
        this.field = fieldControl({
            id: computed(() => undefined),
            labelable: false,
            value: this.value,
            filled: computed(() => this.value() !== null),
            // the hidden input of the first end that fails the validation, else the start's
            input: () =>
                [hiddenStart, hiddenEnd].find(
                    (input) => !input.validity.valid,
                ) ?? hiddenStart,
            focusTarget: () => this.start.firstSegment(),
        });
        const field = this.field;
        this.disabled = computed(
            () => this.inputs.disabled() || field.disabled(),
        );
        this.readOnly = computed(() => this.inputs.readOnly());
        this.required = computed(() => this.inputs.required());
        this.invalid = computed(() => {
            const value = this.value();
            const own =
                value !== null &&
                isRangeInvalid(
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
        const owner = (end: RangeEnd) => ({
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
            ) => this.onEdit(end, composed, edit, event),
            onBlur: () => field.blurred(),
            flush: () => this.flush(),
        });
        this.start = new SegmentGroup(
            owner("start"),
            computed(() => this.value()?.start ?? null),
        );
        this.end = new SegmentGroup(
            owner("end"),
            computed(() => this.value()?.end ?? null),
        );

        // a value from outside replaces both ends; a `null` one only when they are complete
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
                if (
                    value !== null ||
                    (this.start.complete() && this.end.complete())
                ) {
                    this.start.replace(value?.start ?? null);
                    this.end.replace(value?.end ?? null);
                }
            });
        });

        effect(() => {
            const granularity = this.inputs.granularity();
            const value = this.value();
            const min = this.inputs.min();
            const max = this.inputs.max();
            const timeZone = this.timeZone();
            const type = hiddenType(kind, granularity, timeZone);
            const write = (
                input: HTMLInputElement,
                name: string | undefined,
                own: FieldValue | null | undefined,
                lower: FieldValue | null | undefined,
                upper: FieldValue | null | undefined,
            ) => {
                // the type first: a value is read in the type it is set in
                input.type = type;
                setInputAttribute(input, "name", name ?? null);
                setInputAttribute(
                    input,
                    "min",
                    boundIso(kind, granularity, lower),
                );
                setInputAttribute(
                    input,
                    "max",
                    boundIso(kind, granularity, upper),
                );
                input.value = isoOf(kind, granularity, own, timeZone);
                input.required = this.required();
                input.disabled = this.disabled();
            };
            // each end's bounds crossed by the other end (spec/date-range-field.md, "Validation")
            write(
                hiddenStart,
                this.inputs.startName(),
                value?.start,
                min,
                edgeOf(kind, max, value?.end, -1),
            );
            write(
                hiddenEnd,
                this.inputs.endName(),
                value?.end,
                edgeOf(kind, min, value?.start, 1),
                max,
            );
        });
        const onStartFocus = () => this.start.firstSegment()?.focus();
        const onEndFocus = () => this.end.firstSegment()?.focus();
        hiddenStart.addEventListener("focus", onStartFocus);
        hiddenEnd.addEventListener("focus", onEndFocus);

        const destroyRef = inject(DestroyRef);
        if (this.browser) {
            destroyRef.onDestroy(
                watchDocumentLanguage(this.document, () =>
                    this.language.update((count) => count + 1),
                ),
            );
        }

        // a form reset returns both ends to the default (the start's input bridges it); a failed
        // validation focuses the first segment of the end that fails it
        const stops: (() => void)[] = [];
        afterNextRender(() => {
            stops.push(
                bridgeForm(hiddenStart, {
                    reset: () => {
                        this.reset();
                        const value = untracked(this.value);
                        const granularity = untracked(this.inputs.granularity);
                        const timeZone = untracked(this.timeZone);
                        hiddenStart.value = isoOf(
                            kind,
                            granularity,
                            value?.start,
                            timeZone,
                        );
                        hiddenEnd.value = isoOf(
                            kind,
                            granularity,
                            value?.end,
                            timeZone,
                        );
                    },
                    invalid: () => this.start.firstSegment(),
                }),
                bridgeForm(hiddenEnd, {
                    invalid: () => this.end.firstSegment(),
                }),
            );
        });

        // a press on the Field's label focuses the start's first segment
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

        destroyRef.onDestroy(() => {
            for (const stop of stops) {
                stop();
            }
            hiddenStart.removeEventListener("focus", onStartFocus);
            hiddenEnd.removeEventListener("focus", onEndFocus);
        });
    }

    /** One end's group of segments. */
    group(end: RangeEnd): SegmentGroup {
        return end === "start" ? this.start : this.end;
    }

    /** The part attribute of one of its parts. */
    part(name: string): string {
        return `${this.component}-${name}`;
    }

    private onEdit(
        end: RangeEnd,
        composed: FieldValue | null,
        edit: SegmentEditKind,
        event: Event,
    ): void {
        const other = untracked(
            (end === "start" ? this.end : this.start).composed,
        );
        const next =
            end === "start"
                ? composeRange(composed, other)
                : composeRange(other, composed);
        const after = rangeIso(
            this.kind,
            untracked(this.inputs.granularity),
            next,
            untracked(this.timeZone),
        );
        if (after === untracked(this.iso)) {
            return;
        }
        this.reported = after;
        this.own.set(next, { reason: editReason(edit, next), event });
    }

    private reset(): void {
        this.field.reset();
        this.reported = null;
        const initial = untracked(this.inputs.defaultValue);
        this.start.replace(initial?.start ?? null);
        this.end.replace(initial?.end ?? null);
        this.own.set(initial, { reason: "none" });
        this.flush();
    }
}
