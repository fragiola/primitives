import { computed, Directive, inject, input } from "@angular/core";
import type { DateSegment } from "@fragiola/primitives/segments";
import {
    injectHost,
    injectId,
    ownAttribute,
} from "@fragiola/primitives-angular/internal";
import {
    DATE_FIELD,
    type DateFieldSegmentState,
} from "../utils/date-field-state.ts";

/**
 * One segment (spec/date-field.md, "State attributes and ARIA"): a `spinbutton` the user types into
 * or steps (the APG), or a literal hidden from assistive technology:
 * `<span [dateFieldSegment]="segment">{{ segment.text }}</span>`, its content the consumer's (the
 * segment's text, or a placeholder's own). Its `aria-label` defaults to the segment's name in the
 * locale; the consumer's static `aria-label` replaces it.
 */
@Directive({
    selector: "[dateFieldSegment]",
    exportAs: "dateFieldSegment",
    host: {
        "[attr.id]": "editable() ? id : null",
        "[attr.role]": "editable() ? 'spinbutton' : null",
        "[attr.tabindex]": "editable() && !dateField.disabled() ? 0 : null",
        "[attr.aria-label]": "ariaLabel()",
        "[attr.aria-labelledby]": "labelledBy()",
        "[attr.aria-valuenow]": "editable() ? segment().value : null",
        "[attr.aria-valuetext]": "editable() ? segment().valueText : null",
        "[attr.aria-valuemin]": "editable() ? segment().min : null",
        "[attr.aria-valuemax]": "editable() ? segment().max : null",
        "[attr.aria-invalid]":
            "editable() && dateField.invalid() ? 'true' : null",
        "[attr.aria-required]":
            "editable() && dateField.required() ? 'true' : null",
        "[attr.aria-readonly]":
            "editable() && dateField.readOnly() ? 'true' : null",
        "[attr.aria-disabled]":
            "editable() && dateField.disabled() ? 'true' : null",
        "[attr.aria-hidden]": "segment().type === 'literal' ? 'true' : null",
        "[attr.contenteditable]": "writable() ? 'true' : null",
        "[attr.inputmode]": "editable() ? inputMode() : null",
        "[attr.spellcheck]": "editable() ? 'false' : null",
        "[attr.autocorrect]": "editable() ? 'off' : null",
        "[attr.autocapitalize]": "editable() ? 'off' : null",
        "[attr.enterkeyhint]": "editable() ? 'next' : null",
        // numeric segments are one left-to-right run, so they keep the locale's order in any
        // direction (spec/date-field.md, "Bidirectional text": structural, React Aria's fix)
        "[style.unicode-bidi]": "numeric() ? 'embed' : null",
        "[style.direction]": "numeric() ? 'ltr' : null",
        "[attr.data-primitives-part]": "dateField.part('segment')",
        "[attr.data-type]": "segment().type",
        "[attr.data-placeholder]":
            "editable() && segment().placeholder ? '' : null",
        "[attr.data-disabled]": "dateField.data().disabled",
        "[attr.data-readonly]": "dateField.data().readonly",
        "[attr.data-required]": "dateField.data().required",
        "[attr.data-invalid]": "dateField.data().invalid",
        "[attr.data-valid]": "dateField.data().valid",
        "[attr.data-dirty]": "dateField.data().dirty",
        "[attr.data-touched]": "dateField.data().touched",
        "[attr.data-filled]": "dateField.data().filled",
        "[attr.data-focused]": "dateField.data().focused",
        "(keydown)": "onKeyDown($event)",
        "(beforeinput)": "onBeforeInput($event)",
        "(focus)": "onFocus()",
        "(blur)": "onBlur($event)",
    },
})
export class DateFieldSegment {
    /** One of the Input's segments. */
    readonly segment = input.required<DateSegment>({
        alias: "dateFieldSegment",
    });
    protected readonly dateField = inject(DATE_FIELD);
    private readonly host = injectHost();
    protected readonly id = injectId("primitives-date-field-segment");
    private readonly ownLabel = ownAttribute("aria-label");
    protected readonly editable = computed(() => this.segment().editable);
    protected readonly writable = computed(
        () =>
            this.editable() &&
            !this.dateField.disabled() &&
            !this.dateField.readOnly(),
    );
    protected readonly numeric = computed(
        () => this.editable() && this.segment().type !== "dayPeriod",
    );
    protected readonly inputMode = computed(() =>
        this.segment().type === "dayPeriod" ? "text" : "numeric",
    );
    protected readonly ariaLabel = computed(
        () =>
            this.ownLabel ??
            (this.editable() ? this.segment().label : null) ??
            null,
    );
    protected readonly labelledBy = computed(() => {
        const label = this.dateField.labelledBy();
        return this.editable() && label !== null ? `${label} ${this.id}` : null;
    });
    /** The segment's state: the field's, with its type and placeholder state. */
    readonly state = computed<DateFieldSegmentState>(() => ({
        ...this.dateField.state(),
        type: this.segment().type,
        placeholder: this.segment().placeholder,
    }));

    protected onKeyDown(event: KeyboardEvent): void {
        if (
            this.editable() &&
            this.dateField.segmentKey(this.segment(), event, this.host)
        ) {
            event.preventDefault();
        }
    }

    // every edit the browser would make is cancelled: the field writes the text from its state
    protected onBeforeInput(event: InputEvent): void {
        if (!this.writable()) {
            return;
        }
        event.preventDefault();
        if (event.inputType === "deleteContentBackward") {
            this.dateField.segmentKey(
                this.segment(),
                new KeyboardEvent("keydown", { key: "Backspace" }),
                this.host,
            );
            return;
        }
        if (event.data !== null && event.data !== "") {
            this.dateField.segmentText(
                this.segment(),
                event.data,
                event,
                this.host,
            );
        }
    }

    protected onFocus(): void {
        if (this.editable()) {
            this.dateField.field.focused();
        }
    }

    protected onBlur(event: FocusEvent): void {
        if (this.editable()) {
            this.dateField.segmentBlur(this.segment(), event);
        }
    }
}
