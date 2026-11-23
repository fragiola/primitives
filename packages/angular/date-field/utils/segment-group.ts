import {
    computed,
    type Signal,
    signal,
    untracked,
    type WritableSignal,
} from "@angular/core";
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
import type { FieldControlBinding } from "@fragiola/primitives-angular/field";
import type { ChangeReason } from "@fragiola/primitives-angular/internal";
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

/** The state every part renders with (spec/date-field.md, "State attributes and ARIA"). */
export interface DateFieldState {
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    /** Out of range or unavailable, or the Field shows an error. */
    invalid: boolean;
}

/** The state attributes of every part: the field's own and its Field's. */
export interface DateFieldData {
    disabled: string | null;
    readonly: string | null;
    required: string | null;
    invalid: string | null;
    valid: string | null;
    dirty: string | null;
    touched: string | null;
    filled: string | null;
    focused: string | null;
}

/**
 * What the Input and Segment directives read from `DATE_FIELD`: one group of segments with its
 * field's state. A DateField or TimeField provides its own; a range field's and a typed picker's
 * ends each provide theirs (spec/date-range-field.md, spec/calendar.md "Typed input").
 */
export interface DateFieldParts {
    /** The part attribute of one of its parts. */
    part(name: string): string;
    readonly segments: Signal<DateSegment[]>;
    readonly state: Signal<DateFieldState>;
    readonly data: Signal<DateFieldData>;
    readonly disabled: Signal<boolean>;
    readonly readOnly: Signal<boolean>;
    readonly required: Signal<boolean>;
    readonly invalid: Signal<boolean>;
    /** The Input's element, once rendered. */
    readonly inputElement: WritableSignal<HTMLElement | null>;
    readonly field: FieldControlBinding;
    /** What each segment's `aria-labelledby` starts with (the Field's label; a range's Input too). */
    readonly labelledBy: Signal<string | null>;
    /** A key on a segment: whether the field took it (its default is then prevented). */
    segmentKey(
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ): boolean;
    /** Text typed into a segment (`beforeinput`'s data). */
    segmentText(
        segment: DateSegment,
        text: string,
        event: Event,
        element: HTMLElement,
    ): void;
    /** A segment lost the focus. */
    segmentBlur(segment: DateSegment, event: FocusEvent): void;
}

/** What a segment group reads from its root, and reports to it. */
export interface SegmentGroupOwner {
    readonly component: string;
    /** The Input's part attribute, when not `<component>-input` (a picker's `-segments`). */
    readonly inputPart?: string;
    readonly kind: SegmentKind;
    readonly format: Signal<SegmentFormat>;
    readonly granularity: Signal<SegmentGranularity>;
    /** The segment values a placeholder's first step starts from (the `placeholderValue`'s). */
    readonly seed: Signal<SegmentValues>;
    readonly state: Signal<DateFieldState>;
    readonly data: Signal<DateFieldData>;
    readonly disabled: Signal<boolean>;
    readonly readOnly: Signal<boolean>;
    readonly required: Signal<boolean>;
    readonly invalid: Signal<boolean>;
    readonly field: FieldControlBinding;
    readonly labelledBy: Signal<string | null>;
    /** The groups the focus moves among (a range's two ends); default: the segment's own. */
    groups?: () => readonly Element[];
    /** An edit changed the segments: the value they make now (`null` while incomplete). */
    onEdit(
        composed: FieldValue | null,
        edit: SegmentEditKind,
        event: Event,
    ): void;
    /** The focus left every group (the field's blur). */
    onBlur(): void;
    /** Renders the change at once, before the next key (AGENTS.md, "Porting", 8). */
    flush(): void;
}

const FIRST_SEGMENT = '[role="spinbutton"][tabindex]';

/**
 * One group of segments (spec/date-field.md): the values the user set (they follow `source`
 * until the first edit or `replace`), the digits being typed, the segments to render and what
 * their keys and text do. A DateField has one; a range field and a range picker's typed input
 * two, one per end. The value and its reports are the root's (`owner.onEdit`).
 */
export class SegmentGroup implements DateFieldParts {
    /** The segment values the user set; `null` until the first edit (they follow `source`). */
    private readonly ownValues = signal<SegmentValues | null>(null);
    readonly values = computed(
        () =>
            this.ownValues() ??
            segmentValuesOf(this.owner.format(), this.source()),
    );
    /** The digits being typed into a segment. */
    readonly edit = signal<SegmentEdit | null>(null);
    readonly segments = computed(() =>
        dateSegments(this.owner.format(), this.values(), this.edit()),
    );
    /** The value the segments make (`null` while one is a placeholder). */
    readonly composed = computed(() =>
        composeSegments(
            this.owner.format(),
            this.owner.kind,
            this.owner.granularity(),
            this.values(),
        ),
    );
    readonly inputElement = signal<HTMLElement | null>(null);
    readonly state: Signal<DateFieldState>;
    readonly data: Signal<DateFieldData>;
    readonly disabled: Signal<boolean>;
    readonly readOnly: Signal<boolean>;
    readonly required: Signal<boolean>;
    readonly invalid: Signal<boolean>;
    readonly field: FieldControlBinding;
    readonly labelledBy: Signal<string | null>;

    constructor(
        private readonly owner: SegmentGroupOwner,
        /** The value the segments show until they are edited or replaced. */
        private readonly source: Signal<Partial<PlainDateTime> | null>,
    ) {
        this.state = owner.state;
        this.data = owner.data;
        this.disabled = owner.disabled;
        this.readOnly = owner.readOnly;
        this.required = owner.required;
        this.invalid = owner.invalid;
        this.field = owner.field;
        this.labelledBy = owner.labelledBy;
    }

    part(name: string): string {
        return name === "input" && this.owner.inputPart !== undefined
            ? this.owner.inputPart
            : `${this.owner.component}-${name}`;
    }

    /** Whether every segment is set. */
    complete(): boolean {
        return isSegmentsComplete(
            untracked(this.owner.format),
            untracked(this.values),
        );
    }

    /** Replaces the segments with a value's (`null`: every one a placeholder). */
    replace(value: Partial<PlainDateTime> | null): void {
        this.ownValues.set(
            segmentValuesOf(untracked(this.owner.format), value),
        );
        this.edit.set(null);
    }

    /** The first focusable segment: the focus target, where a label press and a failed validation go. */
    firstSegment(): HTMLElement | null {
        return (
            untracked(this.inputElement)?.querySelector<HTMLElement>(
                FIRST_SEGMENT,
            ) ?? null
        );
    }

    segmentKey(
        segment: DateSegment,
        event: KeyboardEvent,
        element: HTMLElement,
    ): boolean {
        if (
            segment.type === "literal" ||
            segment.type === "era" ||
            untracked(this.owner.disabled) ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return false;
        }
        const result = segmentKeyDown(
            untracked(this.owner.format),
            untracked(this.values),
            segment.type,
            event.key,
            untracked(this.edit),
            { seed: untracked(this.owner.seed), readOnly: !this.editable() },
        );
        if (result === null) {
            return false;
        }
        if (result.kind !== "move") {
            this.apply(
                result.values,
                result.edit,
                result.kind === "step" ? "step" : "erase",
                event,
            );
        }
        if (result.move !== null) {
            this.move(element, result.move);
        }
        return true;
    }

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
        const format = untracked(this.owner.format);
        const seed = untracked(this.owner.seed);
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
        this.apply(next, typing, "type", event);
        if (advance) {
            this.move(element, "next");
        }
    }

    segmentBlur(segment: DateSegment, event: FocusEvent): void {
        const typing = untracked(this.edit);
        if (typing !== null && typing.type === segment.type) {
            this.edit.set(null);
        }
        const own = (event.currentTarget as HTMLElement | null)?.closest(
            '[role="group"]',
        );
        const groups = this.owner.groups?.() ?? (own == null ? [] : [own]);
        const to = event.relatedTarget as Node | null;
        if (to === null || !groups.some((group) => group.contains(to))) {
            this.owner.onBlur();
        }
    }

    private editable(): boolean {
        return (
            !untracked(this.owner.disabled) && !untracked(this.owner.readOnly)
        );
    }

    private move(element: HTMLElement, move: SegmentMove): void {
        segmentTarget(element, move, this.owner.groups?.())?.focus();
    }

    /** Applies new segment values, reports what they make, and renders before the next key. */
    private apply(
        next: SegmentValues,
        nextEdit: SegmentEdit | null,
        edit: SegmentEditKind,
        event: Event,
    ): void {
        this.ownValues.set(next);
        this.edit.set(nextEdit);
        this.owner.onEdit(untracked(this.composed), edit, event);
        // a controlled value comes back through its binding, and the segments show the key,
        // before the next key (AGENTS.md, "Porting", 8)
        this.owner.flush();
    }
}
