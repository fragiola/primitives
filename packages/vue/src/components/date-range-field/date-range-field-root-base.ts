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
import {
    computed,
    Fragment,
    h,
    type PropType,
    provide,
    type Slots,
    shallowRef,
    type VNode,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type AsProp, asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type {
    DateFieldComponent,
    DateFieldContext,
    DateFieldState,
} from "../date-field/date-field-context.ts";
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
    DateRangeFieldKey,
    type RangeEnd,
} from "./date-range-field-context.ts";

/** A range of field values: two dates, two dates and times, or two times. */
export interface FieldRange<Value extends FieldValue = FieldValue> {
    readonly start: Value;
    readonly end: Value;
}

/** The props DateRangeField.Root and TimeRangeField.Root share (spec/date-range-field.md, "API"). */
export interface DateRangeFieldRootSharedProps {
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

/** The runtime props DateRangeField.Root and TimeRangeField.Root share. */
export const dateRangeFieldSharedProps = {
    ...asProp,
    hourCycle: {
        type: Number as PropType<12 | 24>,
        default: undefined,
    },
    locale: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    startName: { type: String, default: undefined },
    endName: { type: String, default: undefined },
};

/** What the root's state reads from its component's props (each read when needed). */
export interface DateRangeFieldRootOptions<Value extends FieldValue> {
    component: DateFieldComponent;
    kind: SegmentKind;
    props: {
        as: AsProp | undefined;
        hourCycle: 12 | 24 | undefined;
        locale: string | undefined;
        required: boolean;
        readOnly: boolean;
        disabled: boolean;
        startName: string | undefined;
        endName: string | undefined;
    };
    granularity: () => SegmentGranularity;
    value: () => FieldRange<Value> | null | undefined;
    defaultValue: () => FieldRange<Value> | null;
    placeholderValue: () => Partial<PlainDateTime>;
    min: () => Value | undefined;
    max: () => Value | undefined;
    isDateUnavailable?: () => ((date: PlainDate) => boolean) | undefined;
    onChange: (value: FieldRange<Value> | null, details: ChangeDetails) => void;
    attrs: Record<string, unknown>;
    slots: Slots;
}

/** A range's ISO text (`start/end`), empty with none: what the reports compare. */
export function rangeIso(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    range: FieldRange | null | undefined,
): string {
    return range == null
        ? ""
        : `${isoOf(kind, granularity, range.start)}/${isoOf(kind, granularity, range.end)}`;
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
 * hidden form inputs. Returns the root's render.
 */
export function useDateRangeFieldRoot<Value extends FieldValue>(
    options: DateRangeFieldRootOptions<Value>,
): () => VNode {
    const { component, kind, props } = options;
    const own = useControllable<FieldRange | null, ChangeDetails>(
        options.value,
        options.defaultValue(),
        options.onChange as (
            value: FieldRange | null,
            details: ChangeDetails,
        ) => void,
    );
    const localeOf = useDocumentLocale(() => props.locale);
    const format = computed(() =>
        segmentFormat({
            locale: localeOf(),
            kind,
            granularity: options.granularity(),
            hourCycle: props.hourCycle,
        }),
    );
    const seed = computed(() =>
        segmentValuesOf(format.value, options.placeholderValue()),
    );
    const iso = computed(() =>
        rangeIso(kind, options.granularity(), own.value.value),
    );
    // the last value the segments reported, and the value as of the last change (date-field's)
    let reported: string | null = null;
    let current = own.value.value;
    const hiddenStart = shallowRef<HTMLInputElement | null>(null);
    const hiddenEnd = shallowRef<HTMLInputElement | null>(null);
    const field = useFieldControl({
        id: () => undefined,
        labelable: false,
        value: () => own.value.value,
        filled: () => own.value.value !== null,
        // the hidden input of the first end that fails the validation, else the start's
        input: () =>
            [hiddenStart.value, hiddenEnd.value].find(
                (input) => input !== null && !input.validity.valid,
            ) ?? hiddenStart.value,
        focusTarget: () => groups.start.firstSegment(),
    });
    const disabled = () => props.disabled || field.disabled();
    const labelId = () => field.aria()["aria-labelledby"];

    const setValue = (next: FieldRange | null, details: ChangeDetails) => {
        current = next;
        own.set(next, details);
        setTimeout(() => {
            current = own.value.value;
        });
    };
    const compose = (group: SegmentGroup) =>
        composeSegments(
            format.value,
            kind,
            options.granularity(),
            group.values.value,
        );
    const onEdit =
        (end: RangeEnd) =>
        (composed: FieldValue | null, edit: SegmentEditKind, event: Event) => {
            const granularity = options.granularity();
            const next = composeRange(groups, end, composed, compose);
            const after = rangeIso(kind, granularity, next);
            if (after === rangeIso(kind, granularity, current)) {
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
        kind,
        granularity: options.granularity,
        seed: () => seed.value,
        disabled,
        readOnly: () => props.readOnly,
        groups: scope,
        onBlur: () => field.onBlur(),
    };
    const groups: Record<RangeEnd, SegmentGroup> = {
        start: useSegmentGroup({
            ...groupOptions,
            initial: own.value.value?.start ?? null,
            onEdit: onEdit("start"),
        }),
        end: useSegmentGroup({
            ...groupOptions,
            initial: own.value.value?.end ?? null,
            onEdit: onEdit("end"),
        }),
    };
    // a value from outside replaces both ends; a `null` one only when they are complete
    watch(
        iso,
        (next) => {
            current = own.value.value;
            if (next === reported) {
                return;
            }
            reported = null;
            const value = own.value.value;
            if (
                value !== null ||
                (groups.start.complete() && groups.end.complete())
            ) {
                groups.start.replace(value?.start ?? null);
                groups.end.replace(value?.end ?? null);
            }
        },
        { flush: "sync" },
    );

    const state = computed<DateFieldState>(() => {
        const value = own.value.value;
        return {
            disabled: disabled(),
            readOnly: props.readOnly,
            required: props.required,
            invalid:
                (value !== null &&
                    isRangeInvalid(
                        kind,
                        value,
                        options.min(),
                        options.max(),
                        options.isDateUnavailable?.(),
                    )) ||
                field.aria()["aria-invalid"] === "true",
        };
    });

    // a form reset returns both ends to the default (the start's input bridges it); a failed
    // validation focuses the first segment of the end that fails it
    watch(
        [hiddenStart, hiddenEnd],
        ([start, end], _, onCleanup) => {
            if (start === null || end === null) {
                return;
            }
            const stopStart = bridgeForm(start, {
                reset: () => {
                    const initial = options.defaultValue();
                    field.reset();
                    reported = null;
                    groups.start.replace(initial?.start ?? null);
                    groups.end.replace(initial?.end ?? null);
                    setValue(initial, { reason: "none" });
                    // Vue sets `value` as a property only: write the rendered value back
                    const granularity = options.granularity();
                    const shown = own.value.value;
                    start.value = isoOf(kind, granularity, shown?.start);
                    end.value = isoOf(kind, granularity, shown?.end);
                },
                invalid: groups.start.firstSegment,
            });
            const stopEnd = bridgeForm(end, {
                invalid: groups.end.firstSegment,
            });
            onCleanup(() => {
                stopStart();
                stopEnd();
            });
        },
        { flush: "post" },
    );

    // a press on the Field's label focuses the start's first segment
    watch(
        [labelId, groups.start.element],
        ([id, input], _, onCleanup) => {
            if (id === undefined || input === null) {
                return;
            }
            const label = input.ownerDocument.getElementById(id);
            if (label !== null) {
                onCleanup(focusOnLabelPress(label, groups.start.firstSegment));
            }
        },
        { flush: "post" },
    );

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
    provide(DateRangeFieldKey, {
        groups: {
            start: groupContext(groups.start),
            end: groupContext(groups.end),
        },
    });

    const hiddenInput = (
        end: RangeEnd,
        target: typeof hiddenStart,
        name: string | undefined,
        lower: FieldValue | undefined,
        upper: FieldValue | undefined,
        currentState: DateFieldState,
    ) => {
        const granularity = options.granularity();
        return h("input", {
            ref: (element: unknown) => {
                target.value = element as HTMLInputElement | null;
            },
            type:
                kind === "time"
                    ? "time"
                    : granularity === "day"
                      ? "date"
                      : "datetime-local",
            "aria-hidden": "true",
            tabindex: -1,
            name,
            value: isoOf(kind, granularity, own.value.value?.[end]),
            min: boundIso(kind, granularity, lower),
            max: boundIso(kind, granularity, upper),
            step: "any",
            required: currentState.required,
            disabled: currentState.disabled,
            onFocus: () => groups[end].firstSegment()?.focus(),
            style: VISUALLY_HIDDEN_INPUT_STYLE,
            "data-primitives-part": `${component}-hidden-input`,
            "data-range": end,
        });
    };
    return () => {
        const currentState = state.value;
        const value = own.value.value;
        const min = options.min();
        const max = options.max();
        return h(Fragment, [
            renderPart(
                "div",
                { attrs: options.attrs, slots: options.slots },
                props.as,
                currentState,
                {
                    "data-primitives-part": `${component}-root`,
                    ...attributes(),
                },
            ),
            hiddenInput(
                "start",
                hiddenStart,
                props.startName,
                min,
                edgeOf(kind, max, value?.end, -1),
                currentState,
            ),
            hiddenInput(
                "end",
                hiddenEnd,
                props.endName,
                edgeOf(kind, min, value?.start, 1),
                max,
                currentState,
            ),
        ]);
    };
}
