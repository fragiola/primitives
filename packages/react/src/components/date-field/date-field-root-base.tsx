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
import { useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type DateFieldComponent,
    DateFieldContext,
    type DateFieldContextValue,
    type DateFieldState,
} from "./date-field-context.ts";
import { useDocumentLocale } from "./use-document-locale.ts";

/** What a date or time field holds: a date, a date and time, or a time. */
export type FieldValue = PlainDate | PlainDateTime | PlainTime;

/** The props DateField.Root and TimeField.Root share (spec/date-field.md, "API"). */
export interface DateFieldRootSharedProps extends PartProps<DateFieldState> {
    /** `12` or `24`; default: the locale's. */
    hourCycle?: 12 | 24;
    /** BCP 47; default: the document's `lang`, then the browser's. */
    locale?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
}

export interface DateFieldRootBaseProps<Value extends FieldValue>
    extends DateFieldRootSharedProps {
    component: DateFieldComponent;
    kind: SegmentKind;
    granularity: SegmentGranularity;
    value: Value | null | undefined;
    defaultValue: Value | null;
    onValueChange:
        | ((value: Value | null, details: ChangeDetails) => void)
        | undefined;
    placeholderValue: Partial<PlainDateTime>;
    min: Value | undefined;
    max: Value | undefined;
    isDateUnavailable?: ((date: PlainDate) => boolean) | undefined;
}

const NOOP = () => {};

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

/**
 * The state of a DateField or TimeField (spec/date-field.md): the segment values the user set,
 * the digits being typed, the value (complete segments only), its validity and its hidden form
 * input. The segment editing itself is the toolkit's `/segments`.
 */
export function DateFieldRootBase<Value extends FieldValue>({
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
    locale: localeProp,
    required = false,
    readOnly = false,
    disabled: disabledProp = false,
    name,
    children,
    ...props
}: DateFieldRootBaseProps<Value>) {
    const [value, setOwnValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const locale = useDocumentLocale(localeProp);
    const format = useMemo(
        () => segmentFormat({ locale, kind, granularity, hourCycle }),
        [locale, kind, granularity, hourCycle],
    );
    const [values, setValues] = useState<SegmentValues>(() =>
        segmentValuesOf(format, value),
    );
    const [edit, setEdit] = useState<SegmentEdit | null>(null);
    const iso = isoOf(kind, granularity, value);
    // a value given from outside (or reported back) replaces the segments; a `null` one only
    // when they are complete, so a partly typed field keeps what it holds
    const [synced, setSynced] = useState(iso);
    // the last value the segments reported: it coming back changes nothing (the typing goes on)
    const reported = useRef<string | null>(null);
    if (synced !== iso) {
        setSynced(iso);
        if (iso !== reported.current) {
            reported.current = null;
            if (value !== null || isSegmentsComplete(format, values)) {
                setValues(segmentValuesOf(format, value));
                setEdit(null);
            }
        }
    }
    const [input, setInputElement] = useState<HTMLElement | null>(null);
    const hidden = useRef<HTMLInputElement>(null);
    const firstSegment = () =>
        input?.querySelector<HTMLElement>('[role="spinbutton"][tabindex]') ??
        null;
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value,
        filled: value !== null,
        input: () => hidden.current,
        focusTarget: firstSegment,
    });
    const disabled = disabledProp || field.disabled;
    const labelId = field.aria["aria-labelledby"];
    const seed = useMemo(
        () => segmentValuesOf(format, placeholderValue),
        [format, placeholderValue],
    );
    const ownInvalid =
        value !== null &&
        ((min !== undefined && compare(kind, value, min) < 0) ||
            (max !== undefined && compare(kind, value, max) > 0) ||
            (kind === "date" &&
                isDateUnavailable?.(value as PlainDate) === true));
    const invalid = ownInvalid || field.aria["aria-invalid"] === "true";

    // the state as of the last change, so a quick next key never reads a stale render
    const current = useRef({ values, edit, value });
    current.current = { values, edit, value };
    const latest = useRef({
        format,
        seed,
        kind,
        granularity,
        readOnly,
        disabled,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    });
    latest.current = {
        format,
        seed,
        kind,
        granularity,
        readOnly,
        disabled,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    };

    const actions = useMemo(() => {
        /** Applies new segment values: the value follows once they are complete. */
        const apply = (
            next: SegmentValues,
            nextEdit: SegmentEdit | null,
            reason: (value: FieldValue | null) => ChangeReason,
            event: Event,
        ) => {
            const state = latest.current;
            const composed: FieldValue | null = !isSegmentsComplete(
                state.format,
                next,
            )
                ? null
                : state.kind === "time"
                  ? segmentsToTime(next)
                  : state.granularity === "day"
                    ? segmentsToDate(next)
                    : segmentsToDateTime(next);
            current.current = {
                values: next,
                edit: nextEdit,
                value: current.current.value,
            };
            setValues(next);
            setEdit(nextEdit);
            const before = isoOf(
                state.kind,
                state.granularity,
                current.current.value,
            );
            const after = isoOf(state.kind, state.granularity, composed);
            if (after !== before) {
                reported.current = after;
                current.current = {
                    ...current.current,
                    value: composed as Value | null,
                };
                state.setOwnValue(composed as Value | null, {
                    reason: reason(composed),
                    event,
                });
            }
        };
        const editable = () => {
            const state = latest.current;
            return !state.disabled && !state.readOnly;
        };
        return {
            onSegmentKey: (
                segment: DateSegment,
                event: KeyboardEvent,
                element: HTMLElement,
            ) => {
                if (
                    segment.type === "literal" ||
                    segment.type === "era" ||
                    latest.current.disabled ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey
                ) {
                    return false;
                }
                const state = latest.current;
                const { values: before, edit: typing } = current.current;
                const result = segmentKeyDown(
                    state.format,
                    before,
                    segment.type,
                    event.key,
                    typing,
                    { seed: state.seed, readOnly: !editable() },
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
            },
            onSegmentText: (
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
                const state = latest.current;
                let { values: next, edit: typing } = current.current;
                let advance = false;
                for (const character of text) {
                    const result = typeSegment(
                        state.format,
                        next,
                        segment.type,
                        character,
                        typing,
                        state.seed,
                    );
                    if (result === null) {
                        continue;
                    }
                    next = result.values;
                    typing = result.edit;
                    advance = result.advance;
                }
                if (
                    next === current.current.values &&
                    typing === current.current.edit
                ) {
                    return;
                }
                apply(next, typing, () => "input-change", event);
                if (advance) {
                    segmentTarget(element, "next")?.focus();
                }
            },
            onSegmentBlur: (segment: DateSegment, event: FocusEvent) => {
                const { edit: typing } = current.current;
                if (typing !== null && typing.type === segment.type) {
                    current.current = { ...current.current, edit: null };
                    setEdit(null);
                }
                const group = (
                    event.currentTarget as HTMLElement | null
                )?.closest('[role="group"]');
                const to = event.relatedTarget as Node | null;
                if (group == null || to === null || !group.contains(to)) {
                    field.onBlur();
                }
            },
            reset: () => {
                const state = latest.current;
                state.reset();
                reported.current = null;
                const next = segmentValuesOf(state.format, state.defaultValue);
                current.current = {
                    values: next,
                    edit: null,
                    value: state.defaultValue,
                };
                setValues(next);
                setEdit(null);
                state.setOwnValue(state.defaultValue, { reason: "none" });
            },
        };
    }, [field.onBlur]);

    // a form reset returns it to its default, and writes the rendered value back (NumberField's)
    useEffect(() => {
        const element = hidden.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                actions.reset();
                element.value = isoOf(kind, granularity, current.current.value);
            },
            invalid: () =>
                input?.querySelector<HTMLElement>(
                    '[role="spinbutton"][tabindex]',
                ) ?? null,
        });
    }, [input, actions, kind, granularity]);

    // a press on the Field's label focuses the first segment (a label cannot point at a group)
    useEffect(() => {
        if (labelId === undefined || input === null) {
            return undefined;
        }
        const label = input.ownerDocument.getElementById(labelId);
        return label === null
            ? undefined
            : focusOnLabelPress(label, () =>
                  input.querySelector<HTMLElement>(
                      '[role="spinbutton"][tabindex]',
                  ),
              );
    }, [labelId, input]);

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
    const segments = useMemo(
        () => dateSegments(format, values, edit),
        [format, values, edit],
    );
    const context: DateFieldContextValue = {
        ...state,
        component,
        format,
        segments,
        labelId,
        field,
        attributes,
        setInputElement,
        onSegmentKey: actions.onSegmentKey,
        onSegmentText: actions.onSegmentText,
        onSegmentBlur: actions.onSegmentBlur,
    };
    const formName = field.name ?? name;
    const precision = granularity === "second" ? "second" : "minute";
    const bound = (edge: Value | undefined) =>
        edge === undefined
            ? undefined
            : kind === "time"
              ? toIsoTime(edge as PlainTime, precision)
              : isoOf(kind, granularity, edge);
    return (
        <DateFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": `${component}-root`,
                ...attributes,
            })}
            <input
                ref={hidden}
                type={
                    kind === "time"
                        ? "time"
                        : granularity === "day"
                          ? "date"
                          : "datetime-local"
                }
                aria-hidden="true"
                tabIndex={-1}
                name={formName}
                value={iso}
                min={bound(min)}
                max={bound(max)}
                step="any"
                required={required}
                disabled={disabled}
                onChange={NOOP}
                onFocus={() => firstSegment()?.focus()}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part={`${component}-hidden-input`}
            />
        </DateFieldContext.Provider>
    );
}
