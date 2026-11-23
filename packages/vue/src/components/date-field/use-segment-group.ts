import {
    type DateSegment,
    dateSegments,
    isSegmentsComplete,
    type SegmentEdit,
    type SegmentFormat,
    type SegmentGranularity,
    type SegmentKind,
    type SegmentMove,
    type SegmentValues,
    segmentKeyDown,
    segmentTarget,
    segmentValuesOf,
    typeSegment,
} from "@fragiola/primitives/segments";
import type { PlainDateTime } from "@fragiola/primitives/time";
import { computed, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { composeSegments, type FieldValue } from "./field-value.ts";

/** What an edit did: typed a character, erased one (Backspace, Delete), or stepped a segment. */
export type SegmentEditKind = "type" | "erase" | "step";

/** The change reason of an edit (spec/date-field.md, "API"): `null` after an erase clears. */
export function editReason(
    edit: SegmentEditKind,
    value: unknown,
): ChangeReason {
    return edit === "step"
        ? "keyboard"
        : edit === "erase" && value === null
          ? "input-clear"
          : "input-change";
}

export interface SegmentGroupOptions {
    format: () => SegmentFormat;
    kind: SegmentKind;
    granularity: () => SegmentGranularity;
    /** The segment values a placeholder's first step starts from (the `placeholderValue`'s). */
    seed: () => SegmentValues;
    /** The value the segments start from. */
    initial: Partial<PlainDateTime> | null;
    disabled: () => boolean;
    readOnly: () => boolean;
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

const FIRST_SEGMENT = '[role="spinbutton"][tabindex]';

/**
 * One group of segments (spec/date-field.md): the values the user set, the digits being typed,
 * the segments to render and what their keys and text do. A DateField has one; a range field and
 * a range picker's typed input two, one per end (spec/date-range-field.md). The value and its
 * reports are the root's: the group says what its segments make after each edit.
 */
export function useSegmentGroup(options: SegmentGroupOptions) {
    const values = shallowRef<SegmentValues>(
        segmentValuesOf(options.format(), options.initial),
    );
    const edit = shallowRef<SegmentEdit | null>(null);
    const element = shallowRef<HTMLElement | null>(null);

    /** Applies new segment values, and reports what they make. */
    const apply = (
        next: SegmentValues,
        nextEdit: SegmentEdit | null,
        kind: SegmentEditKind,
        event: Event,
    ) => {
        values.value = next;
        edit.value = nextEdit;
        options.onEdit(
            composeSegments(
                options.format(),
                options.kind,
                options.granularity(),
                next,
            ),
            kind,
            event,
        );
    };
    const editable = () => !options.disabled() && !options.readOnly();
    const move = (from: HTMLElement, to: SegmentMove) =>
        segmentTarget(from, to, options.groups?.())?.focus();

    return {
        segments: computed(() =>
            dateSegments(options.format(), values.value, edit.value),
        ),
        /** The segment values as of the last change. */
        values,
        element,
        setElement: elementSetter(element),
        /** The first editable segment: the focus target, where a label press and a failed validation go. */
        firstSegment: () =>
            element.value?.querySelector<HTMLElement>(FIRST_SEGMENT) ?? null,
        /** Whether every segment is set. */
        complete: () => isSegmentsComplete(options.format(), values.value),
        /** Replaces the segments with a value's (`null`: every one a placeholder). */
        replace: (value: Partial<PlainDateTime> | null) => {
            values.value = segmentValuesOf(options.format(), value);
            edit.value = null;
        },
        /** A key on a segment: whether the group took it (its default is then prevented). */
        onSegmentKey: (
            segment: DateSegment,
            event: KeyboardEvent,
            target: HTMLElement,
        ) => {
            if (
                segment.type === "literal" ||
                segment.type === "era" ||
                options.disabled() ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey
            ) {
                return false;
            }
            const result = segmentKeyDown(
                options.format(),
                values.value,
                segment.type,
                event.key,
                edit.value,
                { seed: options.seed(), readOnly: !editable() },
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
            let next = values.value;
            let typing = edit.value;
            let advance = false;
            for (const character of text) {
                const result = typeSegment(
                    options.format(),
                    next,
                    segment.type,
                    character,
                    typing,
                    options.seed(),
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
            apply(next, typing, "type", event);
            if (advance) {
                move(target, "next");
            }
        },
        /** A segment lost the focus: its typed digits are dropped; leaving the groups blurs. */
        onSegmentBlur: (segment: DateSegment, event: FocusEvent) => {
            const typing = edit.value;
            if (typing !== null && typing.type === segment.type) {
                edit.value = null;
            }
            const own = (event.currentTarget as HTMLElement | null)?.closest(
                '[role="group"]',
            );
            const groups = options.groups?.() ?? (own == null ? [] : [own]);
            const to = event.relatedTarget as Node | null;
            if (to === null || !groups.some((group) => group.contains(to))) {
                options.onBlur();
            }
        },
    };
}

export type SegmentGroup = ReturnType<typeof useSegmentGroup>;
