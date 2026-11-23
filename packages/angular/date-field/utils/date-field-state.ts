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
} from "@angular/core";
import {
    type PlainDate,
    watchDocumentLanguage,
} from "@fragiola/primitives/date";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    type DateSegment,
    dateSegments,
    focusOnLabelPress,
    isSegmentsComplete,
    type SegmentEdit,
    type SegmentGranularity,
    type SegmentKind,
    type SegmentValues,
    segmentFormat,
    segmentKeyDown,
    segmentsToDate,
    segmentsToDateTime,
    segmentsToTime,
    segmentTarget,
    segmentValuesOf,
    typeSegment,
} from "@fragiola/primitives/segments";
import type { PlainDateTime, PlainTime } from "@fragiola/primitives/time";
import { toIsoTime } from "@fragiola/primitives/time";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createHiddenInput,
    dataValues,
    injectFlush,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";
import { documentLocale } from "./document-locale.ts";
import { compareValues, type FieldValue, isoOf } from "./field-value.ts";

/** Which root the shared parts sit in: their part attribute names it (spec/date-field.md). */
export type DateFieldComponent = "date-field" | "time-field";

/** The state every part renders with (spec/date-field.md, "State attributes and ARIA"). */
export interface DateFieldState {
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    /** Out of range or unavailable, or the Field shows an error. */
    invalid: boolean;
}

/** A Segment's state: the field's, with its own type and placeholder state. */
export interface DateFieldSegmentState extends DateFieldState {
    type: DateSegment["type"];
    placeholder: boolean;
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
}

/** The enclosing date or time field's state, for its parts (provided by both roots). */
export const DATE_FIELD = new InjectionToken<DateFieldRootState>("DATE_FIELD");

const FIRST_SEGMENT = '[role="spinbutton"][tabindex]';

/**
 * The state of a DateField or TimeField (spec/date-field.md): the segment values the user set, the
 * digits being typed, the value (complete segments only), its validity and its hidden form input,
 * rendered right after the root. The segment editing itself is the toolkit's `/segments`. Created
 * in a root directive's injection context.
 */
export class DateFieldRootState {
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
        }),
    );
    /** The segment values the user set; `null` until the first edit (they follow the value). */
    private readonly ownValues = signal<SegmentValues | null>(null);
    readonly values = computed(
        () => this.ownValues() ?? segmentValuesOf(this.format(), this.value()),
    );
    /** The digits being typed into a segment. */
    readonly edit = signal<SegmentEdit | null>(null);
    readonly segments = computed(() =>
        dateSegments(this.format(), this.values(), this.edit()),
    );
    private readonly seed = computed(() =>
        segmentValuesOf(this.format(), this.inputs.placeholderValue()),
    );
    /** The value's ISO text (the hidden input's value). */
    readonly iso = computed(() =>
        isoOf(this.kind, this.inputs.granularity(), this.value()),
    );
    /** The Input's element, once rendered. */
    readonly inputElement = signal<HTMLElement | null>(null);
    readonly field: ReturnType<typeof fieldControl>;
    readonly disabled: Signal<boolean>;
    readonly readOnly: Signal<boolean>;
    readonly required: Signal<boolean>;
    /** Out of range or unavailable, or the Field shows an error. */
    readonly invalid: Signal<boolean>;
    readonly state: Signal<DateFieldState>;
    /** The state attributes and the field's, for every part. */
    readonly data: Signal<{
        disabled: string | null;
        readonly: string | null;
        required: string | null;
        invalid: string | null;
        valid: string | null;
        dirty: string | null;
        touched: string | null;
        filled: string | null;
        focused: string | null;
    }>;
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
        this.disabled = computed(
            () => this.inputs.disabled() || field.disabled(),
        );
        this.readOnly = computed(() => this.inputs.readOnly());
        this.required = computed(() => this.inputs.required());
        this.invalid = computed(() => {
            const value = this.value();
            const min = this.inputs.min();
            const max = this.inputs.max();
            const own =
                value !== null &&
                ((min != null && compareValues(kind, value, min) < 0) ||
                    (max != null && compareValues(kind, value, max) > 0) ||
                    (kind === "date" &&
                        this.inputs.isDateUnavailable()?.(
                            value as PlainDate,
                        ) === true));
            return own || field.ariaInvalid() === "true";
        });
        this.state = computed(() => ({
            disabled: this.disabled(),
            readOnly: this.readOnly(),
            required: this.required(),
            invalid: this.invalid(),
        }));
        this.data = computed(() => {
            const state = this.state();
            const own = dataValues({
                disabled: state.disabled,
                readonly: state.readOnly,
                required: state.required,
                invalid: state.invalid,
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
                if (
                    value !== null ||
                    isSegmentsComplete(this.format(), this.values())
                ) {
                    this.ownValues.set(segmentValuesOf(this.format(), value));
                    this.edit.set(null);
                }
            });
        });

        const formName = computed(
            () => field.name() ?? this.inputs.name() ?? null,
        );
        effect(() => {
            const granularity = this.inputs.granularity();
            // the type first: a value is read in the type it is set in
            hidden.type =
                kind === "time"
                    ? "time"
                    : granularity === "day"
                      ? "date"
                      : "datetime-local";
            setInputAttribute(hidden, "name", formName());
            setInputAttribute(hidden, "min", this.bound(this.inputs.min()));
            setInputAttribute(hidden, "max", this.bound(this.inputs.max()));
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
        return (
            untracked(this.inputElement)?.querySelector<HTMLElement>(
                FIRST_SEGMENT,
            ) ?? null
        );
    }

    /**
     * A key on a segment (spec/date-field.md, "Keyboard"): whether the field took it (its default
     * is then prevented). A key that moves the focus renders first (AGENTS.md, "Porting", 8).
     */
    segmentKey(
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ): boolean {
        if (
            segment.type === "literal" ||
            segment.type === "era" ||
            untracked(this.disabled) ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return false;
        }
        const result = segmentKeyDown(
            untracked(this.format),
            untracked(this.values),
            segment.type,
            event.key,
            untracked(this.edit),
            { seed: untracked(this.seed), readOnly: !this.editable() },
        );
        if (result === null) {
            return false;
        }
        if (result.kind !== "move") {
            this.apply(
                result.values,
                result.edit,
                (composed) =>
                    result.kind === "step"
                        ? "keyboard"
                        : composed === null
                          ? "input-clear"
                          : "input-change",
                event,
            );
        }
        if (result.move !== null) {
            segmentTarget(element, result.move)?.focus();
        }
        return true;
    }

    /** Text typed into a segment (`beforeinput`'s data, spec/date-field.md "Typing"). */
    segmentText(
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ): void {
        if (
            segment.type === "literal" ||
            segment.type === "era" ||
            !this.editable()
        ) {
            return;
        }
        const format = untracked(this.format);
        const seed = untracked(this.seed);
        const before = untracked(this.values);
        const typingBefore = untracked(this.edit);
        let next = before;
        let typing = typingBefore;
        let advance = false;
        for (const character of text) {
            const result = typeSegment(
                format,
                next,
                segment.type,
                character,
                typing,
                seed,
            );
            if (result === null) {
                continue;
            }
            next = result.values;
            typing = result.edit;
            advance = result.advance;
        }
        if (next === before && typing === typingBefore) {
            return;
        }
        this.apply(next, typing, () => "input-change", event);
        if (advance) {
            segmentTarget(element, "next")?.focus();
        }
    }

    /** A segment lost the focus: its typed digits are dropped; leaving the Input is the blur. */
    segmentBlur(segment: DateSegment, event: FocusEvent): void {
        const typing = untracked(this.edit);
        if (typing !== null && typing.type === segment.type) {
            this.edit.set(null);
        }
        const group = (event.currentTarget as HTMLElement | null)?.closest(
            '[role="group"]',
        );
        const to = event.relatedTarget as Node | null;
        if (group == null || to === null || !group.contains(to)) {
            this.field.blurred();
        }
    }

    private editable(): boolean {
        return !untracked(this.disabled) && !untracked(this.readOnly);
    }

    /** Applies new segment values: the value follows once they are complete. */
    private apply(
        next: SegmentValues,
        nextEdit: SegmentEdit | null,
        reason: (value: FieldValue | null) => ChangeReason,
        event: Event,
    ): void {
        const granularity = untracked(this.inputs.granularity);
        const composed: FieldValue | null = !isSegmentsComplete(
            untracked(this.format),
            next,
        )
            ? null
            : this.kind === "time"
              ? segmentsToTime(next)
              : granularity === "day"
                ? segmentsToDate(next)
                : segmentsToDateTime(next);
        this.ownValues.set(next);
        this.edit.set(nextEdit);
        const before = untracked(this.iso);
        const after = isoOf(this.kind, granularity, composed);
        if (after !== before) {
            this.reported = after;
            this.own.set(composed, { reason: reason(composed), event });
        }
        // a controlled value comes back through its binding, and the segments show the key,
        // before the next key (AGENTS.md, "Porting", 8)
        this.flush();
    }

    private reset(): void {
        this.field.reset();
        this.reported = null;
        const defaultValue = untracked(this.inputs.defaultValue);
        this.ownValues.set(
            segmentValuesOf(untracked(this.format), defaultValue),
        );
        this.edit.set(null);
        this.own.set(defaultValue, { reason: "none" });
        this.flush();
    }

    /** A bound's ISO text at the field's granularity. */
    private bound(edge: FieldValue | null | undefined): string | null {
        if (edge == null) {
            return null;
        }
        const granularity = this.inputs.granularity();
        return this.kind === "time"
            ? toIsoTime(
                  edge as PlainTime,
                  granularity === "second" ? "second" : "minute",
              )
            : isoOf(this.kind, granularity, edge);
    }
}
