import {
    computed,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    untracked,
} from "@angular/core";
import { DATE_FIELD } from "@fragiola/primitives-angular/date-field";
import {
    injectHost,
    injectId,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";
import type { RangeEnd } from "../utils/field-range.ts";
import { DATE_RANGE_FIELD, RangeEndParts } from "../utils/range-end-parts.ts";

/**
 * The `group` of one end's segments (spec/date-range-field.md, "Anatomy"):
 * `<div dateRangeFieldInput range="start" aria-label="Start date" #start="dateRangeFieldInput">`.
 * Named by the consumer (`aria-label`) and, inside a Field, by its label too; its segments by both
 * and their own name ("Stay Start date month"). A directive renders no template, so the consumer
 * renders the segments: `@for (segment of start.segments(); track segment.index) { <span
 * [dateFieldSegment]="segment">{{ segment.text }}</span> }`.
 */
@Directive({
    selector: "[dateRangeFieldInput]",
    exportAs: "dateRangeFieldInput",
    providers: [
        {
            provide: DATE_FIELD,
            useFactory: () =>
                inject(forwardRef(() => DateRangeFieldInput)).parts,
        },
    ],
    host: {
        role: "group",
        "[attr.id]": "id",
        "[attr.aria-labelledby]": "inputLabelledBy()",
        "[attr.aria-describedby]": "describedBy()",
        "[attr.data-range]": "range()",
        "[attr.data-primitives-part]": "parts.part('input')",
        "[attr.data-disabled]": "parts.data().disabled",
        "[attr.data-readonly]": "parts.data().readonly",
        "[attr.data-required]": "parts.data().required",
        "[attr.data-invalid]": "parts.data().invalid",
        "[attr.data-valid]": "parts.data().valid",
        "[attr.data-dirty]": "parts.data().dirty",
        "[attr.data-touched]": "parts.data().touched",
        "[attr.data-filled]": "parts.data().filled",
        "[attr.data-focused]": "parts.data().focused",
    },
})
export class DateRangeFieldInput {
    /** The end whose segments it holds. */
    readonly range = input.required<RangeEnd>();
    private readonly groups = inject(DATE_RANGE_FIELD);
    protected readonly id =
        ownAttribute("id") ?? injectId("primitives-range-input");
    private readonly ownLabelledBy = ownAttribute("aria-labelledby");
    private readonly ownDescribedBy = ownAttribute("aria-describedby");
    private readonly host = injectHost();
    private readonly ownLabel = ownAttribute("aria-label");
    /** Whether the consumer names it (`aria-label`, static or bound). */
    private readonly named = () =>
        this.ownLabel !== null || this.host.hasAttribute("aria-label");
    /** The Field's label, then the Input itself when it has its own name. */
    private readonly labelledBy = computed(() => {
        const label = this.groups.group(this.range()).field.labelledBy();
        const parts = [label, this.named() ? this.id : null].filter(
            (part) => part !== null,
        );
        return parts.length === 0 ? null : parts.join(" ");
    });
    /** What the segments read (`DATE_FIELD`): this end's group. */
    protected readonly parts = new RangeEndParts(
        this.groups,
        () => this.range(),
        this.labelledBy,
    );
    /** The segments to render, in the locale's order (the toolkit's `DateSegment`). */
    readonly segments = computed(() =>
        this.groups.group(this.range()).segments(),
    );
    /** The field's state. */
    readonly state = computed(() => this.groups.group(this.range()).state());
    protected readonly inputLabelledBy = computed(
        () =>
            this.ownLabelledBy ??
            (this.groups.group(this.range()).field.labelledBy() === null
                ? null
                : this.labelledBy()),
    );
    protected readonly describedBy = computed(
        () =>
            this.ownDescribedBy ??
            this.groups.group(this.range()).field.describedBy(),
    );

    constructor() {
        const host = this.host;
        // the end's group gets this element once `range` is known
        effect((onCleanup) => {
            const group = this.groups.group(this.range());
            untracked(() => group.inputElement.set(host));
            onCleanup(() => {
                if (untracked(group.inputElement) === host) {
                    group.inputElement.set(null);
                }
            });
        });
    }
}
