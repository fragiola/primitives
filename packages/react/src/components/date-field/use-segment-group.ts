import {
    type DateSegment,
    dateSegments,
    isSegmentsComplete,
    type SegmentEdit,
    type SegmentFormat,
    type SegmentGranularity,
    type SegmentKind,
    type SegmentValues,
    segmentKeyDown,
    segmentTarget,
    segmentValuesOf,
    typeSegment,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { useCallback, useMemo, useRef, useState } from "react";
import { composeSegments, type FieldValue } from "./field-value.ts";

/** What an edit did: typed a character, erased one (Backspace, Delete), or stepped a segment. */
export type SegmentEditKind = "type" | "erase" | "step";

export interface SegmentGroupOptions {
    format: SegmentFormat;
    kind: SegmentKind;
    granularity: SegmentGranularity;
    /** The segment values a placeholder's first step starts from (the `placeholderValue`'s). */
    seed: SegmentValues;
    /** The value the segments start from. */
    initial: Partial<PlainDateTime> | null;
    disabled: boolean;
    readOnly: boolean;
    /**
     * The groups the focus moves among, in order (a range's two ends: spec/date-range-field.md);
     * default: this group alone.
     */
    groups?: () => readonly Element[];
    /** An edit changed the segments: the value they make now (`null` while incomplete). */
    onEdit: (
        composed: FieldValue | null,
        edit: SegmentEditKind,
        event: Event,
    ) => void;
    /** The focus left every group (the field's blur). */
    onBlur: () => void;
}

/**
 * One group of segments (spec/date-field.md): the values the user set, the digits being typed,
 * the segments to render and what their keys and text do. A DateField has one; a range field and
 * a range picker's typed input two, one per end (spec/date-range-field.md). The value and its
 * reports are the root's: the group says what its segments make after each edit.
 */
export function useSegmentGroup(options: SegmentGroupOptions) {
    const { format } = options;
    const [values, setValues] = useState<SegmentValues>(() =>
        segmentValuesOf(format, options.initial),
    );
    const [edit, setEdit] = useState<SegmentEdit | null>(null);
    const [element, setElement] = useState<HTMLElement | null>(null);
    // the state as of the last change, so a quick next key never reads a stale render
    const current = useRef({ values, edit });
    const latest = useRef(options);
    latest.current = options;

    const actions = useMemo(() => {
        /** Applies new segment values, and reports what they make. */
        const apply = (
            next: SegmentValues,
            nextEdit: SegmentEdit | null,
            kind: SegmentEditKind,
            event: Event,
        ) => {
            const state = latest.current;
            current.current = { values: next, edit: nextEdit };
            setValues(next);
            setEdit(nextEdit);
            state.onEdit(
                composeSegments(
                    state.format,
                    state.kind,
                    state.granularity,
                    next,
                ),
                kind,
                event,
            );
        };
        const editable = () => {
            const state = latest.current;
            return !state.disabled && !state.readOnly;
        };
        const move = (
            from: HTMLElement,
            to: Parameters<typeof segmentTarget>[1],
        ) => segmentTarget(from, to, latest.current.groups?.())?.focus();
        return {
            /** A key on a segment: whether the group took it (its default is then prevented). */
            onSegmentKey: (
                segment: DateSegment,
                event: KeyboardEvent,
                target: HTMLElement,
            ) => {
                const state = latest.current;
                if (
                    segment.type === "literal" ||
                    segment.type === "era" ||
                    state.disabled ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey
                ) {
                    return false;
                }
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
                        result.kind === "step" ? "step" : "erase",
                        event,
                    );
                }
                if (result.move !== null) {
                    move(target, result.move);
                }
                return true;
            },
            /** Text typed into a segment (`beforeinput`'s data). */
            onSegmentText: (
                segment: DateSegment,
                text: string,
                event: Event,
                target: HTMLElement,
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
                apply(next, typing, "type", event);
                if (advance) {
                    move(target, "next");
                }
            },
            /** A segment lost the focus: its typed digits are dropped; leaving the groups blurs. */
            onSegmentBlur: (
                segment: DateSegment,
                event: FocusEvent,
                target: HTMLElement,
            ) => {
                const { edit: typing } = current.current;
                if (typing !== null && typing.type === segment.type) {
                    current.current = { ...current.current, edit: null };
                    setEdit(null);
                }
                // the segment itself: a native event's `currentTarget` is React's root
                const own = target.closest('[role="group"]');
                const groups =
                    latest.current.groups?.() ?? (own === null ? [] : [own]);
                const to = event.relatedTarget as Node | null;
                if (
                    to === null ||
                    !groups.some((group) => group.contains(to))
                ) {
                    latest.current.onBlur();
                }
            },
            /** Replaces the segments with a value's (`null`: every one a placeholder). */
            replace: (value: Partial<PlainDateTime> | null) => {
                const next = segmentValuesOf(latest.current.format, value);
                current.current = { values: next, edit: null };
                setValues(next);
                setEdit(null);
            },
        };
    }, []);

    const firstSegment = useCallback(
        () =>
            element?.querySelector<HTMLElement>(
                '[role="spinbutton"][tabindex]',
            ) ?? null,
        [element],
    );
    const segments = useMemo(
        () => dateSegments(format, values, edit),
        [format, values, edit],
    );
    return {
        segments,
        /** Whether every segment is set (the state as of the last change). */
        complete: () => isSegmentsComplete(format, current.current.values),
        /** The segment values as of the last change. */
        values: () => current.current.values,
        element,
        setElement,
        /** The first editable segment: the focus target, where a label press and a failed validation go. */
        firstSegment,
        ...actions,
    };
}

export type SegmentGroup = ReturnType<typeof useSegmentGroup>;
