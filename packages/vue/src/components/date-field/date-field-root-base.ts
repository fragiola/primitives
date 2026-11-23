import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
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
import {
    compareDateTimes,
    compareTimes,
    type PlainDateTime,
    type PlainTime,
    toIsoDateTime,
    toIsoTime,
} from "@fragiola/primitives/time";
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
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type AsProp, asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type DateFieldComponent,
    DateFieldKey,
    type DateFieldState,
} from "./date-field-context.ts";
import { useDocumentLocale } from "./use-document-locale.ts";

/** What a date or time field holds: a date, a date and time, or a time. */
export type FieldValue = PlainDate | PlainDateTime | PlainTime;

/** The props DateField.Root and TimeField.Root share (spec/date-field.md, "API"). */
export interface DateFieldRootSharedProps {
    /** `12` or `24`; default: the locale's. */
    hourCycle?: 12 | 24;
    /** BCP 47; default: the document's `lang`, then the browser's. */
    locale?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
}

/** The runtime props DateField.Root and TimeField.Root share. */
export const dateFieldSharedProps = {
    ...asProp,
    hourCycle: {
        type: Number as PropType<12 | 24>,
        default: undefined,
    },
    locale: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: undefined },
};

/** What the root's state reads from its component's props (each read when needed). */
export interface DateFieldRootOptions<Value extends FieldValue> {
    component: DateFieldComponent;
    kind: SegmentKind;
    props: {
        as: AsProp | undefined;
        hourCycle: 12 | 24 | undefined;
        locale: string | undefined;
        required: boolean;
        readOnly: boolean;
        disabled: boolean;
        name: string | undefined;
    };
    granularity: () => SegmentGranularity;
    value: () => Value | null | undefined;
    defaultValue: () => Value | null;
    placeholderValue: () => Partial<PlainDateTime>;
    min: () => Value | undefined;
    max: () => Value | undefined;
    isDateUnavailable?: () => ((date: PlainDate) => boolean) | undefined;
    onChange: (value: Value | null, details: ChangeDetails) => void;
    attrs: Record<string, unknown>;
    slots: Slots;
}

/** A value's ISO text at the field's granularity (spec/date-field.md, "Forms"). */
function isoOf(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    value: FieldValue | null | undefined,
): string {
    if (value == null) {
        return "";
    }
    const precision = granularity === "second" ? "second" : "minute";
    if (kind === "time") {
        return toIsoTime(value as PlainTime, precision);
    }
    if (granularity === "day") {
        return toIsoDate(value as PlainDate);
    }
    // a `PlainDate` bound counts as its midnight
    const {
        hour = 0,
        minute = 0,
        second = 0,
        millisecond = 0,
    } = value as Partial<PlainDateTime>;
    return toIsoDateTime(
        { ...(value as PlainDate), hour, minute, second, millisecond },
        precision,
    );
}

function compare(kind: SegmentKind, a: FieldValue, b: FieldValue): number {
    return kind === "time"
        ? compareTimes(a as PlainTime, b as PlainTime)
        : compareDateTimes(a as PlainDate, b as PlainDate);
}

const FIRST_SEGMENT = '[role="spinbutton"][tabindex]';

/**
 * The state of a DateField or TimeField (spec/date-field.md): the segment values the user set,
 * the digits being typed, the value (complete segments only), its validity and its hidden form
 * input. The segment editing itself is the toolkit's `/segments`. Returns the root's render.
 */
export function useDateFieldRoot<Value extends FieldValue>(
    options: DateFieldRootOptions<Value>,
): () => VNode {
    const { component, kind, props } = options;
    const own = useControllable<Value | null, ChangeDetails>(
        options.value,
        options.defaultValue(),
        options.onChange,
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
    const values = shallowRef<SegmentValues>(
        segmentValuesOf(format.value, own.value.value),
    );
    const edit = shallowRef<SegmentEdit | null>(null);
    const iso = computed(() =>
        isoOf(kind, options.granularity(), own.value.value),
    );
    // the last value the segments reported: it coming back changes nothing (the typing goes on)
    let reported: string | null = null;
    // the value as of the last change, so a quick next key never reads a value a controlled
    // consumer has not rendered yet (NumberField's)
    let current = own.value.value;
    // a value given from outside (or reported back) replaces the segments; a `null` one only
    // when they are complete, so a partly typed field keeps what it holds
    watch(
        iso,
        (next) => {
            current = own.value.value;
            if (next === reported) {
                return;
            }
            reported = null;
            if (
                own.value.value !== null ||
                isSegmentsComplete(format.value, values.value)
            ) {
                values.value = segmentValuesOf(format.value, own.value.value);
                edit.value = null;
            }
        },
        { flush: "sync" },
    );

    const input = shallowRef<HTMLElement | null>(null);
    const hidden = shallowRef<HTMLInputElement | null>(null);
    const firstSegment = () =>
        input.value?.querySelector<HTMLElement>(FIRST_SEGMENT) ?? null;
    const field = useFieldControl({
        id: () => undefined,
        labelable: false,
        value: () => own.value.value,
        filled: () => own.value.value !== null,
        input: () => hidden.value,
        focusTarget: firstSegment,
    });
    const disabled = () => props.disabled || field.disabled();
    const labelId = () => field.aria()["aria-labelledby"];
    const seed = computed(() =>
        segmentValuesOf(format.value, options.placeholderValue()),
    );
    const state = computed<DateFieldState>(() => {
        const value = own.value.value;
        const min = options.min();
        const max = options.max();
        const unavailable = options.isDateUnavailable?.();
        const ownInvalid =
            value !== null &&
            ((min !== undefined && compare(kind, value, min) < 0) ||
                (max !== undefined && compare(kind, value, max) > 0) ||
                (kind === "date" &&
                    unavailable?.(value as PlainDate) === true));
        return {
            disabled: disabled(),
            readOnly: props.readOnly,
            required: props.required,
            invalid: ownInvalid || field.aria()["aria-invalid"] === "true",
        };
    });

    const setValue = (next: Value | null, details: ChangeDetails) => {
        current = next;
        own.set(next, details);
        // an override for the keys of this task only: a consumer that refused the value renders
        // nothing, and the next task reads the value it kept
        setTimeout(() => {
            current = own.value.value;
        });
    };
    /** Applies new segment values: the value follows once they are complete. */
    const apply = (
        next: SegmentValues,
        nextEdit: SegmentEdit | null,
        reason: (value: FieldValue | null) => ChangeReason,
        event: Event,
    ) => {
        const granularity = options.granularity();
        const composed: FieldValue | null = !isSegmentsComplete(
            format.value,
            next,
        )
            ? null
            : kind === "time"
              ? segmentsToTime(next)
              : granularity === "day"
                ? segmentsToDate(next)
                : segmentsToDateTime(next);
        values.value = next;
        edit.value = nextEdit;
        const before = isoOf(kind, granularity, current);
        const after = isoOf(kind, granularity, composed);
        if (after !== before) {
            reported = after;
            setValue(composed as Value | null, {
                reason: reason(composed),
                event,
            });
        }
    };
    const editable = () => !disabled() && !props.readOnly;

    const onSegmentKey = (
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ) => {
        if (
            segment.type === "literal" ||
            segment.type === "era" ||
            disabled() ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return false;
        }
        const result = segmentKeyDown(
            format.value,
            values.value,
            segment.type,
            event.key,
            edit.value,
            { seed: seed.value, readOnly: !editable() },
        );
        if (result === null) {
            return false;
        }
        if (result.kind !== "move") {
            apply(
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
    };
    const onSegmentText = (
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ) => {
        if (
            segment.type === "literal" ||
            segment.type === "era" ||
            !editable()
        ) {
            return;
        }
        let next = values.value;
        let typing = edit.value;
        let advance = false;
        for (const character of text) {
            const result = typeSegment(
                format.value,
                next,
                segment.type,
                character,
                typing,
                seed.value,
            );
            if (result === null) {
                continue;
            }
            next = result.values;
            typing = result.edit;
            advance = result.advance;
        }
        if (next === values.value && typing === edit.value) {
            return;
        }
        apply(next, typing, () => "input-change", event);
        if (advance) {
            segmentTarget(element, "next")?.focus();
        }
    };
    const onSegmentBlur = (segment: DateSegment, event: FocusEvent) => {
        const typing = edit.value;
        if (typing !== null && typing.type === segment.type) {
            edit.value = null;
        }
        const group = (event.currentTarget as HTMLElement | null)?.closest(
            '[role="group"]',
        );
        const to = event.relatedTarget as Node | null;
        if (group == null || to === null || !group.contains(to)) {
            field.onBlur();
        }
    };
    const reset = () => {
        field.reset();
        reported = null;
        const initial = options.defaultValue();
        values.value = segmentValuesOf(format.value, initial);
        edit.value = null;
        setValue(initial, { reason: "none" });
    };

    // a form reset returns it to its default, and writes the rendered value back (NumberField's)
    watch(
        [hidden, input],
        ([element, group], _, onCleanup) => {
            if (element === null) {
                return;
            }
            onCleanup(
                bridgeForm(element, {
                    reset: () => {
                        const rendered = iso.value;
                        reset();
                        // the rendered value, which a patch follows (a controlled field that
                        // refuses the reset keeps its input): Vue sets `value` as a property only,
                        // so the browser's reset emptied it, and an unchanged value patches nothing
                        element.value = rendered;
                    },
                    invalid: () =>
                        group?.querySelector<HTMLElement>(FIRST_SEGMENT) ??
                        null,
                }),
            );
        },
        { flush: "post" },
    );

    // a press on the Field's label focuses the first segment (a label cannot point at a group)
    watch(
        [labelId, input],
        ([id, group], _, onCleanup) => {
            if (id === undefined || group === null) {
                return;
            }
            const label = group.ownerDocument.getElementById(id);
            if (label !== null) {
                onCleanup(
                    focusOnLabelPress(label, () =>
                        group.querySelector<HTMLElement>(FIRST_SEGMENT),
                    ),
                );
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
    const segments = computed(() =>
        dateSegments(format.value, values.value, edit.value),
    );
    provide(DateFieldKey, {
        component,
        state,
        format,
        segments,
        labelId,
        field,
        attributes,
        setInputElement: elementSetter(input),
        onSegmentKey,
        onSegmentText,
        onSegmentBlur,
    });

    const bound = (edge: Value | undefined) => {
        if (edge === undefined) {
            return undefined;
        }
        const granularity = options.granularity();
        return kind === "time"
            ? toIsoTime(
                  edge as PlainTime,
                  granularity === "second" ? "second" : "minute",
              )
            : isoOf(kind, granularity, edge);
    };
    return () => {
        const currentState = state.value;
        const granularity = options.granularity();
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
            h("input", {
                ref: (element: unknown) => {
                    hidden.value = element as HTMLInputElement | null;
                },
                type:
                    kind === "time"
                        ? "time"
                        : granularity === "day"
                          ? "date"
                          : "datetime-local",
                "aria-hidden": "true",
                tabindex: -1,
                name: field.name() ?? props.name,
                value: iso.value,
                min: bound(options.min()),
                max: bound(options.max()),
                step: "any",
                required: currentState.required,
                disabled: currentState.disabled,
                onFocus: () => firstSegment()?.focus(),
                style: VISUALLY_HIDDEN_INPUT_STYLE,
                "data-primitives-part": `${component}-hidden-input`,
            }),
        ]);
    };
}
