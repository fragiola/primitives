import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
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
import type { Disambiguation, TimeZone } from "@fragiola/primitives/time-zone";
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
import {
    type DateFieldComponent,
    DateFieldKey,
    type DateFieldState,
} from "./date-field-context.ts";
import {
    boundIso,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "./field-value.ts";
import { useDocumentLocale } from "./use-document-locale.ts";
import { editReason, useSegmentGroup } from "./use-segment-group.ts";

export type { FieldValue } from "./field-value.ts";

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

/**
 * The calendar system and time zone a date field takes (spec/calendar-systems.md,
 * spec/time-zones.md): DateField, the range fields and the typed pickers.
 */
export interface DateFieldSystemProps {
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems`: the segments show and edit
     * its fields (an era where it has several); values stay ISO. Default: the ISO calendar.
     */
    calendar?: CalendarSystem;
    /**
     * A time zone from `@fragiola/primitives/time-zone` (`timeZone("America/New_York")`): the
     * values are `ZonedDateTime`s in it, and a date and time shows the zone's name.
     */
    timeZone?: TimeZone;
    /** Hides the zone's name segment. */
    hideTimeZone?: boolean;
    /** How a wall time the zone skips or repeats resolves (Temporal's; default `compatible`). */
    disambiguation?: Disambiguation;
}

/** The runtime props of `DateFieldSystemProps`. */
export const dateFieldSystemProps = {
    calendar: {
        type: Object as PropType<CalendarSystem>,
        default: undefined,
    },
    timeZone: { type: Object as PropType<TimeZone>, default: undefined },
    hideTimeZone: { type: Boolean, default: undefined },
    disambiguation: {
        type: String as PropType<Disambiguation>,
        default: undefined,
    },
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
    } & DateFieldSystemProps;
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
            calendar: props.calendar,
            timeZone: props.timeZone,
            hideTimeZone: props.hideTimeZone,
            disambiguation: props.disambiguation,
        }),
    );
    const seed = computed(() =>
        segmentValuesOf(format.value, options.placeholderValue()),
    );
    const iso = computed(() =>
        isoOf(kind, options.granularity(), own.value.value, props.timeZone),
    );
    // the last value the segments reported: it coming back changes nothing (the typing goes on)
    let reported: string | null = null;
    // the value as of the last change, so a quick next key never reads a value a controlled
    // consumer has not rendered yet (NumberField's)
    let current = own.value.value;
    const hidden = shallowRef<HTMLInputElement | null>(null);
    const field = useFieldControl({
        id: () => undefined,
        labelable: false,
        value: () => own.value.value,
        filled: () => own.value.value !== null,
        input: () => hidden.value,
        focusTarget: () => group.firstSegment(),
    });
    const disabled = () => props.disabled || field.disabled();
    const labelId = () => field.aria()["aria-labelledby"];

    const setValue = (next: Value | null, details: ChangeDetails) => {
        current = next;
        own.set(next, details);
        // an override for the keys of this task only: a consumer that refused the value renders
        // nothing, and the next task reads the value it kept
        setTimeout(() => {
            current = own.value.value;
        });
    };
    const group = useSegmentGroup({
        format: () => format.value,
        kind,
        granularity: options.granularity,
        seed: () => seed.value,
        initial: own.value.value,
        disabled,
        readOnly: () => props.readOnly,
        onEdit: (composed, edit, event) => {
            const granularity = options.granularity();
            const after = isoOf(kind, granularity, composed, props.timeZone);
            if (after === isoOf(kind, granularity, current, props.timeZone)) {
                return;
            }
            reported = after;
            setValue(composed as Value | null, {
                reason: editReason(edit, composed),
                event,
            });
        },
        onBlur: () => field.onBlur(),
    });
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
            if (own.value.value !== null || group.complete()) {
                group.replace(own.value.value);
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
                    isOutOfRange(
                        kind,
                        value,
                        options.min(),
                        options.max(),
                        options.isDateUnavailable?.(),
                    )) ||
                field.aria()["aria-invalid"] === "true",
        };
    });

    const reset = () => {
        field.reset();
        reported = null;
        const initial = options.defaultValue();
        group.replace(initial);
        setValue(initial, { reason: "none" });
    };

    // a form reset returns it to its default, and writes the rendered value back (NumberField's)
    watch(
        [hidden, group.element],
        ([element], _, onCleanup) => {
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
                    invalid: group.firstSegment,
                }),
            );
        },
        { flush: "post" },
    );

    // a press on the Field's label focuses the first segment (a label cannot point at a group)
    watch(
        [labelId, group.element],
        ([id, input], _, onCleanup) => {
            if (id === undefined || input === null) {
                return;
            }
            const label = input.ownerDocument.getElementById(id);
            if (label !== null) {
                onCleanup(focusOnLabelPress(label, group.firstSegment));
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
    provide(DateFieldKey, {
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
                    // a zoned value's text (`…-05:00[America/New_York]`) is no native date's
                    props.timeZone
                        ? "text"
                        : kind === "time"
                          ? "time"
                          : granularity === "day"
                            ? "date"
                            : "datetime-local",
                "aria-hidden": "true",
                tabindex: -1,
                name: field.name() ?? props.name,
                value: iso.value,
                min: boundIso(kind, granularity, options.min()),
                max: boundIso(kind, granularity, options.max()),
                step: "any",
                required: currentState.required,
                disabled: currentState.disabled,
                onFocus: () => group.firstSegment()?.focus(),
                style: VISUALLY_HIDDEN_INPUT_STYLE,
                "data-primitives-part": `${component}-hidden-input`,
            }),
        ]);
    };
}
